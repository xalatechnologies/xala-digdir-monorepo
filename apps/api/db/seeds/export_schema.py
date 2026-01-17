#!/usr/bin/env python3
"""
Export complete database schema from migrations to JSON
This allows AI and humans to understand the entire schema for seed generation
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any

class SchemaExporter:
    def __init__(self, migrations_dir: str):
        self.migrations_dir = Path(migrations_dir)
        self.schema = {
            "version": "1.0.0",
            "generated_at": None,
            "total_migrations": 0,
            "schemas": {
                "platform": {"tables": {}, "enums": {}, "functions": {}},
                "domain": {"tables": {}, "enums": {}, "functions": {}},
                "monitoring": {"tables": {}, "enums": {}, "functions": {}},
                "compliance": {"tables": {}, "enums": {}, "functions": {}}
            },
            "relationships": [],
            "indexes": [],
            "triggers": []
        }
    
    def parse_create_table(self, sql: str, schema_name: str) -> Dict[str, Any]:
        """Parse CREATE TABLE statement"""
        table_pattern = r'CREATE TABLE (?:IF NOT EXISTS )?(\w+)\.(\w+)\s*\((.*?)\);'
        
        matches = re.finditer(table_pattern, sql, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            schema = match.group(1)
            table_name = match.group(2)
            columns_sql = match.group(3)
            
            if schema not in self.schema["schemas"]:
                continue
            
            table_def = {
                "name": table_name,
                "schema": schema,
                "columns": [],
                "primary_key": [],
                "foreign_keys": [],
                "unique_constraints": [],
                "check_constraints": []
            }
            
            # Parse columns
            columns = self.parse_columns(columns_sql)
            table_def["columns"] = columns
            
            # Parse constraints
            constraints = self.parse_constraints(columns_sql)
            table_def.update(constraints)
            
            self.schema["schemas"][schema]["tables"][table_name] = table_def
    
    def parse_columns(self, columns_sql: str) -> List[Dict[str, Any]]:
        """Parse column definitions"""
        columns = []
        
        # Split by commas (but not inside parentheses)
        lines = columns_sql.strip().split('\n')
        
        for line in lines:
            line = line.strip().rstrip(',')
            
            # Skip constraints
            if any(keyword in line.upper() for keyword in ['PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK', 'CONSTRAINT']):
                continue
            
            # Parse column
            col_match = re.match(r'(\w+)\s+([A-Za-z0-9_\(\)]+)(.*)', line)
            if col_match:
                col_name = col_match.group(1)
                col_type = col_match.group(2)
                col_modifiers = col_match.group(3).strip()
                
                column = {
                    "name": col_name,
                    "type": col_type,
                    "nullable": "NOT NULL" not in col_modifiers.upper(),
                    "default": self.extract_default(col_modifiers),
                    "references": self.extract_references(col_modifiers)
                }
                
                columns.append(column)
        
        return columns
    
    def extract_default(self, modifiers: str) -> str:
        """Extract DEFAULT value"""
        default_match = re.search(r'DEFAULT\s+(.+?)(?:\s+|$)', modifiers, re.IGNORECASE)
        if default_match:
            return default_match.group(1).strip()
        return None
    
    def extract_references(self, modifiers: str) -> Dict[str, str]:
        """Extract REFERENCES"""
        ref_match = re.search(r'REFERENCES\s+(\w+)\.(\w+)\((\w+)\)', modifiers, re.IGNORECASE)
        if ref_match:
            return {
                "schema": ref_match.group(1),
                "table": ref_match.group(2),
                "column": ref_match.group(3)
            }
        return None
    
    def parse_constraints(self, columns_sql: str) -> Dict[str, List]:
        """Parse table constraints"""
        result = {
            "primary_key": [],
            "foreign_keys": [],
            "unique_constraints": [],
            "check_constraints": []
        }
        
        # Primary key
        pk_match = re.search(r'PRIMARY KEY\s*\((.*?)\)', columns_sql, re.IGNORECASE)
        if pk_match:
            result["primary_key"] = [col.strip() for col in pk_match.group(1).split(',')]
        
        # Foreign keys
        fk_pattern = r'FOREIGN KEY\s*\((.*?)\)\s*REFERENCES\s+(\w+)\.(\w+)\s*\((.*?)\)'
        for match in re.finditer(fk_pattern, columns_sql, re.IGNORECASE):
            result["foreign_keys"].append({
                "columns": [col.strip() for col in match.group(1).split(',')],
                "references": {
                    "schema": match.group(2),
                    "table": match.group(3),
                    "columns": [col.strip() for col in match.group(4).split(',')]
                }
            })
        
        return result
    
    def parse_create_type(self, sql: str) -> None:
        """Parse CREATE TYPE (enum)"""
        type_pattern = r'CREATE TYPE (\w+)\.(\w+) AS ENUM\s*\((.*?)\);'
        
        for match in re.finditer(type_pattern, sql, re.DOTALL | re.IGNORECASE):
            schema = match.group(1)
            type_name = match.group(2)
            values = match.group(3)
            
            if schema in self.schema["schemas"]:
                enum_values = [v.strip().strip("'\"") for v in values.split(',')]
                self.schema["schemas"][schema]["enums"][type_name] = {
                    "name": type_name,
                    "values": enum_values
                }
    
    def parse_create_function(self, sql: str) -> None:
        """Parse CREATE FUNCTION"""
        func_pattern = r'CREATE (?:OR REPLACE )?FUNCTION (\w+)\.(\w+)\s*\((.*?)\)\s*RETURNS\s+(\w+)'
        
        for match in re.finditer(func_pattern, sql, re.DOTALL | re.IGNORECASE):
            schema = match.group(1)
            func_name = match.group(2)
            params = match.group(3)
            returns = match.group(4)
            
            if schema in self.schema["schemas"]:
                self.schema["schemas"][schema]["functions"][func_name] = {
                    "name": func_name,
                    "parameters": params.strip(),
                    "returns": returns
                }
    
    def export(self) -> Dict:
        """Export full schema from all migrations"""
        from datetime import datetime
        
        self.schema["generated_at"] = datetime.now().isoformat()
        
        # Read all migration files
        migration_files = sorted(self.migrations_dir.glob('*.sql'))
        self.schema["total_migrations"] = len(migration_files)
        
        for migration_file in migration_files:
            print(f"Parsing {migration_file.name}...")
            
            sql = migration_file.read_text()
            
            # Parse different SQL constructs
            self.parse_create_table(sql, "all")
            self.parse_create_type(sql)
            self.parse_create_function(sql)
        
        return self.schema
    
    def generate_summary(self) -> Dict:
        """Generate schema summary statistics"""
        summary = {
            "total_tables": 0,
            "total_columns": 0,
            "total_enums": 0,
            "total_functions": 0,
            "by_schema": {}
        }
        
        for schema_name, schema_data in self.schema["schemas"].items():
            tables_count = len(schema_data["tables"])
            columns_count = sum(len(t["columns"]) for t in schema_data["tables"].values())
            enums_count = len(schema_data["enums"])
            functions_count = len(schema_data["functions"])
            
            summary["total_tables"] += tables_count
            summary["total_columns"] += columns_count
            summary["total_enums"] += enums_count
            summary["total_functions"] += functions_count
            
            summary["by_schema"][schema_name] = {
                "tables": tables_count,
                "columns": columns_count,
                "enums": enums_count,
                "functions": functions_count
            }
        
        return summary


def main():
    import sys
    from datetime import datetime
    
    # Export schema
    exporter = SchemaExporter('apps/api/drizzle')
    schema = exporter.export()
    summary = exporter.generate_summary()
    
    # Add summary
    schema["summary"] = summary
    
    # Write to file
    output_file = 'apps/api/db/seeds/schemas/complete-database-schema.json'
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(schema, f, indent=2)
    
    print(f"\n✅ Schema exported to {output_file}")
    print(f"\nSummary:")
    print(f"  Total tables: {summary['total_tables']}")
    print(f"  Total columns: {summary['total_columns']}")
    print(f"  Total enums: {summary['total_enums']}")
    print(f"  Total functions: {summary['total_functions']}")
    print(f"\nBy schema:")
    for schema_name, stats in summary['by_schema'].items():
        print(f"  {schema_name}: {stats['tables']} tables, {stats['columns']} columns")


if __name__ == '__main__':
    main()

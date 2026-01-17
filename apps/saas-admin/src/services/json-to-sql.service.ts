/**
 * JSON to SQL Converter Service
 * 
 * Converts generated JSON seed data to SQL INSERT statements
 */

export class JsonToSqlService {
  async convertToSQL(entityType: string, data: any[]): Promise<string> {
    switch (entityType) {
      case 'rental_object':
        return this.convertRentalObjects(data);
      case 'user':
        return this.convertUsers(data);
      case 'amenity':
        return this.convertAmenities(data);
      case 'addon':
        return this.convertAddOns(data);
      case 'booking':
        return this.convertBookings(data);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }
  
  private convertRentalObjects(objects: any[]): string {
    let sql = `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Rental Objects (${objects.length} items)\n\n`;
    sql += `BEGIN;\n\n`;
    
    // Core rental objects
    sql += `INSERT INTO domain.rental_objects (\n`;
    sql += `  id, tenant_id, organization_id, category_key, type_code,\n`;
    sql += `  time_mode, status, title, slug, description, capacity,\n`;
    sql += `  address, postal_code, city, country, published_at, is_active\n`;
    sql += `) VALUES\n`;
    
    const values = objects.map((obj, i) => {
      const comma = i < objects.length - 1 ? ',' : '';
      return `  ('${obj.id}', '${obj.tenantId}', '${obj.organizationId}',
   '${obj.categoryKey}', 'SPACE', 'PERIOD', 'PUBLISHED',
   '${this.escape(obj.name)}', '${obj.slug}',
   '${this.escape(obj.description)}', ${obj.capacity},
   '${this.escape(obj.metadata.location.address)}', 
   '${obj.metadata.location.postalCode}', 
   '${obj.metadata.location.city}', 'Norway',
   NOW() - INTERVAL '${objects.length - i} days', true)${comma}`;
    });
    
    sql += values.join('\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
  }
  
  private convertUsers(users: any[]): string {
    let sql = `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Users (${users.length} items)\n\n`;
    sql += `BEGIN;\n\n`;
    
    sql += `INSERT INTO platform.users (\n`;
    sql += `  id, tenant_id, email, name, status, is_active\n`;
    sql += `) VALUES\n`;
    
    const values = users.map((user, i) => {
      const comma = i < users.length - 1 ? ',' : '';
      return `  ('${user.id}', '${user.tenantId}', '${user.email}', '${this.escape(user.name)}', 'active', true)${comma}`;
    });
    
    sql += values.join('\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
  }
  
  private convertAmenities(amenities: any[]): string {
    let sql = `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Amenities (${amenities.length} items)\n\n`;
    sql += `BEGIN;\n\n`;
    
    sql += `INSERT INTO domain.amenities (\n`;
    sql += `  tenant_id, code, name, description, group_code, icon_key, is_active\n`;
    sql += `) VALUES\n`;
    
    const values = amenities.map((amenity, i) => {
      const comma = i < amenities.length - 1 ? ',' : '';
      return `  ('${amenity.tenantId}', '${amenity.code}', '${this.escape(amenity.name)}', '${this.escape(amenity.description || '')}', '${amenity.groupCode || 'FACILITIES'}', '${amenity.iconKey || 'default'}', true)${comma}`;
    });
    
    sql += values.join('\n');
    sql += `\nON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name;\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
  }
  
  private convertAddOns(addons: any[]): string {
    let sql = `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Add-ons (${addons.length} items)\n\n`;
    sql += `BEGIN;\n\n`;
    
    sql += `INSERT INTO domain.addons (\n`;
    sql += `  tenant_id, code, name, description, pricing_model, base_price_cents, is_required, max_units, is_active\n`;
    sql += `) VALUES\n`;
    
    const values = addons.map((addon, i) => {
      const comma = i < addons.length - 1 ? ',' : '';
      return `  ('${addon.tenantId}', '${addon.code}', '${this.escape(addon.name)}', '${this.escape(addon.description || '')}', '${addon.pricingModel}', ${addon.basePriceCents}, ${addon.isRequired || false}, ${addon.maxUnits || 1}, true)${comma}`;
    });
    
    sql += values.join('\n');
    sql += `\nON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name;\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
  }
  
  private convertBookings(bookings: any[]): string {
    let sql = `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Bookings (${bookings.length} items)\n\n`;
    sql += `BEGIN;\n\n`;
    
    sql += `INSERT INTO domain.bookings (\n`;
    sql += `  id, tenant_id, rental_object_id, user_id, organization_id,\n`;
    sql += `  start_time, end_time, status, booking_mode,\n`;
    sql += `  total_price_cents, deposit_cents, payment_status, notes\n`;
    sql += `) VALUES\n`;
    
    const values = bookings.map((booking, i) => {
      const comma = i < bookings.length - 1 ? ',' : '';
      return `  ('${booking.id}', '${booking.tenantId}', '${booking.rentalObjectId}', '${booking.userId}', '${booking.organizationId}',
   '${booking.startTime}', '${booking.endTime}', '${booking.status}', '${booking.bookingMode}',
   ${booking.totalPriceCents}, ${booking.depositCents || 'NULL'}, '${booking.paymentStatus}', '${this.escape(booking.notes || '')}')${comma}`;
    });
    
    sql += values.join('\n');
    sql += `\nON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;\n\n`;
    
    sql += `COMMIT;\n`;
    return sql;
  }
  
  private escape(str: string): string {
    return str.replace(/'/g, "''");
  }
}

export const jsonToSqlService = new JsonToSqlService();

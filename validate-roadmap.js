const yaml = require('yaml');
const fs = require('fs');

try {
  const content = fs.readFileSync('roadmap.yml', 'utf8');
  const roadmap = yaml.parse(content);

  // Validate structure
  if (!roadmap.phases || !Array.isArray(roadmap.phases)) {
    console.error('ERROR: phases array not found');
    process.exit(1);
  }

  // Check phase count
  console.log('Phases:', roadmap.phases.length);

  // Validate each phase has required fields
  let valid = true;
  const phaseIds = [];
  const itemIds = [];

  roadmap.phases.forEach((phase, idx) => {
    if (!phase.id) {
      console.error(`ERROR: Phase ${idx} missing id`);
      valid = false;
    } else {
      phaseIds.push(phase.id);
    }

    if (!phase.name) {
      console.error(`ERROR: Phase ${phase.id || idx} missing name`);
      valid = false;
    }

    if (!phase.items || !Array.isArray(phase.items)) {
      console.error(`ERROR: Phase ${phase.id || idx} missing items array`);
      valid = false;
    } else {
      phase.items.forEach((item, itemIdx) => {
        if (!item.id) {
          console.error(`ERROR: Item ${itemIdx} in phase ${phase.id} missing id`);
          valid = false;
        } else {
          if (itemIds.includes(item.id)) {
            console.error(`ERROR: Duplicate item ID: ${item.id}`);
            valid = false;
          }
          itemIds.push(item.id);
        }

        if (!item.status) {
          console.error(`ERROR: Item ${item.id || itemIdx} missing status`);
          valid = false;
        } else {
          const validStatuses = ['DONE', 'PARTIAL', 'MISSING', 'PLANNED'];
          if (!validStatuses.includes(item.status)) {
            console.error(`ERROR: Item ${item.id} has invalid status: ${item.status}`);
            valid = false;
          }
        }
      });
    }
  });

  // Print summary
  console.log('Phase IDs:', phaseIds.join(', '));
  console.log('Total Items:', itemIds.length);
  console.log('Item IDs:', itemIds.join(', '));

  if (valid) {
    console.log('Valid Structure');
  } else {
    console.error('INVALID Structure');
    process.exit(1);
  }

} catch (err) {
  console.error('YAML Parse Error:', err.message);
  process.exit(1);
}

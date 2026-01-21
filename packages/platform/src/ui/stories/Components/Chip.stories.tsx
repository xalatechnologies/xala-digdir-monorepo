import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from '@xalatechnologies/platform/ui';
import { useState } from 'react';

const meta: Meta = {
  title: 'Components/Chip',
  parameters: {
    docs: {
      description: {
        component: `
Chip components for selections, filters, and tags.

## Variants
- **Chip.Radio** - Single selection (like radio buttons)
- **Chip.Checkbox** - Multiple selection
- **Chip.Removable** - Dismissible chips
- **Chip.Button** - Clickable action chips

## Accessibility
- Keyboard navigable
- Proper ARIA roles
- Focus indicators
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const RadioChips: Story = {
  render: function Render() {
    const [selected, setSelected] = useState('option1');
    return (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        <Chip.Radio 
          name="filter" 
          value="option1"
          checked={selected === 'option1'}
          onChange={() => setSelected('option1')}
        >
          All
        </Chip.Radio>
        <Chip.Radio 
          name="filter" 
          value="option2"
          checked={selected === 'option2'}
          onChange={() => setSelected('option2')}
        >
          Active
        </Chip.Radio>
        <Chip.Radio 
          name="filter" 
          value="option3"
          checked={selected === 'option3'}
          onChange={() => setSelected('option3')}
        >
          Completed
        </Chip.Radio>
      </div>
    );
  },
};

export const CheckboxChips: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['tag1']);
    const toggle = (tag: string) => {
      setSelected(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
    };
    return (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        <Chip.Checkbox 
          name="tags"
          checked={selected.includes('tag1')}
          onChange={() => toggle('tag1')}
        >
          Indoor
        </Chip.Checkbox>
        <Chip.Checkbox 
          name="tags"
          checked={selected.includes('tag2')}
          onChange={() => toggle('tag2')}
        >
          Outdoor
        </Chip.Checkbox>
        <Chip.Checkbox 
          name="tags"
          checked={selected.includes('tag3')}
          onChange={() => toggle('tag3')}
        >
          Accessible
        </Chip.Checkbox>
      </div>
    );
  },
};

export const RemovableChips: Story = {
  render: function Render() {
    const [chips, setChips] = useState(['Oslo', 'Bergen', 'Trondheim']);
    return (
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        {chips.map(chip => (
          <Chip.Removable 
            key={chip}
            onClick={() => setChips(prev => prev.filter(c => c !== chip))}
          >
            {chip}
          </Chip.Removable>
        ))}
      </div>
    );
  },
};

export const ButtonChips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
      <Chip.Button onClick={() => console.log('clicked')}>Action 1</Chip.Button>
      <Chip.Button onClick={() => console.log('clicked')}>Action 2</Chip.Button>
      <Chip.Button onClick={() => console.log('clicked')}>Action 3</Chip.Button>
    </div>
  ),
};

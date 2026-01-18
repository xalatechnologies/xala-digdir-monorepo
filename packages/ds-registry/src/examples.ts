/**
 * Code examples for Designsystemet components and patterns.
 * 
 * This file contains comprehensive examples showing best practices
 * and common usage patterns for each component.
 */

export interface CodeExample {
  /** Unique identifier */
  id: string;
  /** Example title */
  title: string;
  /** Brief description */
  description: string;
  /** The example code */
  code: string;
  /** Any imports needed */
  imports?: string[];
  /** Related component or pattern */
  component?: string;
  /** Tags for categorization */
  tags?: string[];
}

export const componentExamples: CodeExample[] = [
  // Button Examples
  {
    id: 'button-basic',
    title: 'Basic Button',
    description: 'Primary action button with default styling.',
    code: `import { Button } from '@xala/ds';

export function Example() {
  return <Button>Save changes</Button>;
}`,
    component: 'button',
    tags: ['basic', 'primary'],
  },
  {
    id: 'button-variants',
    title: 'Button Variants',
    description: 'Different button styles for various contexts.',
    code: `import { Button } from '@xala/ds';

export function Example() {
  return (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}`,
    component: 'button',
    tags: ['variants', 'styling'],
  },
  {
    id: 'button-aschild',
    title: 'Button as Link',
    description: 'Render button as an anchor element using asChild.',
    code: `import { Button } from '@xala/ds';

export function Example() {
  return (
    <Button asChild>
      <a href="/dashboard">Go to dashboard</a>
    </Button>
  );
}`,
    component: 'button',
    tags: ['asChild', 'navigation'],
  },
  {
    id: 'button-loading',
    title: 'Loading Button',
    description: 'Button with loading state and spinner.',
    code: `import { Button, Spinner } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? <Spinner /> : 'Submit'}
    </Button>
  );
}`,
    component: 'button',
    tags: ['loading', 'async'],
  },

  // Input Examples
  {
    id: 'input-basic',
    title: 'Basic Input',
    description: 'Standard text input with placeholder.',
    code: `import { Input } from '@xala/ds';

export function Example() {
  return <Input placeholder="Enter your name" />;
}`,
    component: 'input',
    tags: ['basic', 'text'],
  },
  {
    id: 'input-with-field',
    title: 'Input with Field',
    description: 'Input with label, description, and error handling.',
    code: `import { Field, Input } from '@xala/ds';

export function Example() {
  return (
    <Field>
      <Field.Label>Email address</Field.Label>
      <Field.Input
        type="email"
        placeholder="name@example.com"
        required
      />
      <Field.Description>
        We'll never share your email with anyone else.
      </Field.Description>
      <Field.Error>This field is required</Field.Error>
    </Field>
  );
}`,
    component: 'input',
    tags: ['field', 'validation'],
  },
  {
    id: 'input-validation',
    title: 'Input Validation',
    description: 'Real-time validation with error states.',
    code: `import { Field, Input } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setError(validateEmail(newValue));
  };

  return (
    <Field>
      <Field.Label>Email</Field.Label>
      <Field.Input
        type="email"
        value={value}
        onChange={handleChange}
        aria-invalid={!!error}
      />
      {error && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}`,
    component: 'input',
    tags: ['validation', 'real-time'],
  },

  // Select Examples
  {
    id: 'select-basic',
    title: 'Basic Select',
    description: 'Dropdown selection with options.',
    code: `import { Select } from '@xala/ds';

export function Example() {
  return (
    <Select>
      <option value="">Choose an option</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </Select>
  );
}`,
    component: 'select',
    tags: ['basic', 'dropdown'],
  },
  {
    id: 'select-with-field',
    title: 'Select with Field',
    description: 'Select with proper labeling and description.',
    code: `import { Field, Select } from '@xala/ds';

export function Example() {
  return (
    <Field>
      <Field.Label>Country</Field.Label>
      <Field.Select>
        <option value="">Select your country</option>
        <option value="no">Norway</option>
        <option value="se">Sweden</option>
        <option value="dk">Denmark</option>
      </Field.Select>
      <Field.Description>
        Used for shipping calculations
      </Field.Description>
    </Field>
  );
}`,
    component: 'select',
    tags: ['field', 'form'],
  },

  // Checkbox Examples
  {
    id: 'checkbox-basic',
    title: 'Basic Checkbox',
    description: 'Single checkbox for binary choice.',
    code: `import { Checkbox } from '@xala/ds';

export function Example() {
  return (
    <Checkbox>
      I agree to the terms and conditions
    </Checkbox>
  );
}`,
    component: 'checkbox',
    tags: ['basic', 'single'],
  },
  {
    id: 'checkbox-group',
    title: 'Checkbox Group',
    description: 'Multiple checkboxes for multi-select.',
    code: `import { Fieldset, Checkbox, Field } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [values, setValues] = useState({
    notifications: false,
    newsletter: true,
    updates: false,
  });

  const handleChange = (name: string, checked: boolean) => {
    setValues(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <Fieldset>
      <Fieldset.Legend>Communication preferences</Fieldset.Legend>
      <Field>
        <Checkbox
          checked={values.notifications}
          onCheckedChange={(checked) => 
            handleChange('notifications', checked as boolean)
          }
        >
          Email notifications
        </Checkbox>
      </Field>
      <Field>
        <Checkbox
          checked={values.newsletter}
          onCheckedChange={(checked) => 
            handleChange('newsletter', checked as boolean)
          }
        >
          Weekly newsletter
        </Checkbox>
      </Field>
      <Field>
        <Checkbox
          checked={values.updates}
          onCheckedChange={(checked) => 
            handleChange('updates', checked as boolean)
          }
        >
          Product updates
        </Checkbox>
      </Field>
    </Fieldset>
  );
}`,
    component: 'checkbox',
    tags: ['group', 'multi-select'],
  },

  // Radio Examples
  {
    id: 'radio-group',
    title: 'Radio Group',
    description: 'Radio buttons for single selection.',
    code: `import { Fieldset, Radio, Field } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [value, setValue] = useState('option1');

  return (
    <Fieldset>
      <Fieldset.Legend>Choose a plan</Fieldset.Legend>
      <Field>
        <Radio
          name="plan"
          value="option1"
          checked={value === 'option1'}
          onCheckedChange={() => setValue('option1')}
        >
          Free plan
        </Radio>
      </Field>
      <Field>
        <Radio
          name="plan"
          value="option2"
          checked={value === 'option2'}
          onCheckedChange={() => setValue('option2')}
        >
          Pro plan
        </Radio>
      </Field>
      <Field>
        <Radio
          name="plan"
          value="option3"
          checked={value === 'option3'}
          onCheckedChange={() => setValue('option3')}
        >
          Enterprise plan
        </Radio>
      </Field>
    </Fieldset>
  );
}`,
    component: 'radio',
    tags: ['group', 'single-select'],
  },

  // Alert Examples
  {
    id: 'alert-variants',
    title: 'Alert Variants',
    description: 'Different alert types for various messages.',
    code: `import { Alert } from '@xala/ds';

export function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      <Alert variant="info">
        Information: Your session will expire in 5 minutes
      </Alert>
      <Alert variant="success">
        Success: Your changes have been saved
      </Alert>
      <Alert variant="warning">
        Warning: Please review your input
      </Alert>
      <Alert variant="error">
        Error: Unable to process your request
      </Alert>
    </div>
  );
}`,
    component: 'alert',
    tags: ['variants', 'messaging'],
  },

  // Card Examples
  {
    id: 'card-basic',
    title: 'Basic Card',
    description: 'Simple card with content and actions.',
    code: `import { Card, Button, Text } from '@xala/ds';

export function Example() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
      </Card.Header>
      <Card.Content>
        <Text>
          This is the card content area where you can display
          information, images, or other components.
        </Text>
      </Card.Content>
      <Card.Footer>
        <Button>Action</Button>
      </Card.Footer>
    </Card>
  );
}`,
    component: 'card',
    tags: ['basic', 'layout'],
  },

  // Table Examples
  {
    id: 'table-basic',
    title: 'Basic Table',
    description: 'Data table with headers and rows.',
    code: `import { Table } from '@xala/ds';

export function Example() {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Age</Table.HeaderCell>
          <Table.HeaderCell>City</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>John Doe</Table.Cell>
          <Table.Cell>30</Table.Cell>
          <Table.Cell>Oslo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Jane Smith</Table.Cell>
          <Table.Cell>25</Table.Cell>
          <Table.Cell>Bergen</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}`,
    component: 'table',
    tags: ['basic', 'data'],
  },

  // Tabs Examples
  {
    id: 'tabs-basic',
    title: 'Basic Tabs',
    description: 'Tabbed interface for content organization.',
    code: `import { Tabs } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Trigger value="tab1">Profile</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Settings</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Security</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <h3>Profile Information</h3>
        <p>User profile details go here...</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <h3>Settings</h3>
        <p>Application settings...</p>
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <h3>Security</h3>
        <p>Security settings...</p>
      </Tabs.Content>
    </Tabs>
  );
}`,
    component: 'tabs',
    tags: ['basic', 'navigation'],
  },

  // Dialog Examples
  {
    id: 'dialog-basic',
    title: 'Basic Dialog',
    description: 'Modal dialog with title and actions.',
    code: `import { Dialog, Button } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Confirm Action</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            Are you sure you want to perform this action?
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}`,
    component: 'dialog',
    tags: ['basic', 'modal'],
  },

  // Avatar Examples
  {
    id: 'avatar-variants',
    title: 'Avatar Variants',
    description: 'Different avatar styles and sizes.',
    code: `import { Avatar } from '@xala/ds';

export function Example() {
  return (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
      <Avatar size="xs" src="/avatar1.jpg" alt="User 1" />
      <Avatar size="sm" src="/avatar2.jpg" alt="User 2" />
      <Avatar size="md">
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar size="lg">
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar>
    </div>
  );
}`,
    component: 'avatar',
    tags: ['variants', 'sizes'],
  },

  // Badge Examples
  {
    id: 'badge-variants',
    title: 'Badge Variants',
    description: 'Different badge styles and colors.',
    code: `import { Badge } from '@xala/ds';

export function Example() {
  return (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
      <Badge variant="neutral">Default</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Error</Badge>
    </div>
  );
}`,
    component: 'badge',
    tags: ['variants', 'status'],
  },

  // Skeleton Examples
  {
    id: 'skeleton-loading',
    title: 'Skeleton Loading',
    description: 'Loading placeholders for content.',
    code: `import { Skeleton, Card } from '@xala/ds';

export function Example() {
  return (
    <Card>
      <Card.Header>
        <Skeleton width={200} height={24} />
      </Card.Header>
      <Card.Content>
        <Skeleton count={3} />
      </Card.Content>
    </Card>
  );
}`,
    component: 'skeleton',
    tags: ['loading', 'placeholder'],
  },

  // Tooltip Examples
  {
    id: 'tooltip-basic',
    title: 'Basic Tooltip',
    description: 'Tooltip with hover text.',
    code: `import { Tooltip, Button } from '@xala/ds';

export function Example() {
  return (
    <Tooltip content="This action saves your changes">
      <Button>Save</Button>
    </Tooltip>
  );
}`,
    component: 'tooltip',
    tags: ['basic', 'help'],
  },
];

export const patternExamples: CodeExample[] = [
  // Form Validation
  {
    id: 'form-complete',
    title: 'Complete Form with Validation',
    description: 'Full form with fields, validation, and error handling.',
    code: `import { 
  Button, 
  Field, 
  Fieldset, 
  Input, 
  ErrorSummary,
  Checkbox 
} from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    terms: false,
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!values.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!values.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!values.terms) {
      newErrors.terms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted:', values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(errors).length > 0 && (
        <ErrorSummary>
          <ErrorSummary.Heading>
            There are {Object.keys(errors).length} errors
          </ErrorSummary.Heading>
          <ErrorSummary.List>
            {errors.name && (
              <ErrorSummary.Item href="#name-field">
                {errors.name}
              </ErrorSummary.Item>
            )}
            {errors.email && (
              <ErrorSummary.Item href="#email-field">
                {errors.email}
              </ErrorSummary.Item>
            )}
            {errors.terms && (
              <ErrorSummary.Item href="#terms-field">
                {errors.terms}
              </ErrorSummary.Item>
            )}
          </ErrorSummary.List>
        </ErrorSummary>
      )}
      
      <Fieldset>
        <Fieldset.Legend>Personal Information</Fieldset.Legend>
        
        <Field id="name-field">
          <Field.Label>Name</Field.Label>
          <Field.Input
            value={values.name}
            onChange={(e) => setValues(prev => ({ 
              ...prev, 
              name: e.target.value 
            }))}
            aria-invalid={!!errors.name}
          />
          {errors.name && <Field.Error>{errors.name}</Field.Error>}
        </Field>
        
        <Field id="email-field">
          <Field.Label>Email</Field.Label>
          <Field.Input
            type="email"
            value={values.email}
            onChange={(e) => setValues(prev => ({ 
              ...prev, 
              email: e.target.value 
            }))}
            aria-invalid={!!errors.email}
          />
          {errors.email && <Field.Error>{errors.email}</Field.Error>}
        </Field>
        
        <Field id="terms-field">
          <Checkbox
            checked={values.terms}
            onCheckedChange={(checked) => setValues(prev => ({ 
              ...prev, 
              terms: checked as boolean 
            }))}
            aria-invalid={!!errors.terms}
          >
            I accept the terms and conditions
          </Checkbox>
          {errors.terms && <Field.Error>{errors.terms}</Field.Error>}
        </Field>
      </Fieldset>
      
      <Button type="submit">Submit</Button>
    </form>
  );
}`,
    component: 'formValidation',
    tags: ['form', 'validation', 'complete'],
  },

  // Search with Suggestions
  {
    id: 'search-autocomplete',
    title: 'Search with Autocomplete',
    description: 'Search input with categorized suggestions.',
    code: `import { Search, Suggestion, Divider } from '@xala/ds';
import { useState, useEffect } from 'react';

const mockSuggestions = [
  { category: 'Products', items: ['Laptop', 'Mouse', 'Keyboard'] },
  { category: 'Help', items: ['How to order', 'Shipping info', 'Returns'] },
  { category: 'Users', items: ['John Doe', 'Jane Smith'] },
];

export function Example() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSuggestions.map(group => ({
        ...group,
        items: group.items.filter(item => 
          item.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter(group => group.items.length > 0);
      
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions(mockSuggestions);
      setIsOpen(false);
    }
  }, [query]);

  return (
    <div style={{ position: 'relative' }}>
      <Search
        value={query}
        onChange={setQuery}
        placeholder="Search products, help, or users..."
      />
      
      {isOpen && (
        <Suggestion>
          {suggestions.map((group, groupIndex) => (
            <div key={group.category}>
              {groupIndex > 0 && <Divider />}
              <Suggestion.Group>
                <Suggestion.GroupLabel>
                  {group.category}
                </Suggestion.GroupLabel>
                {group.items.map(item => (
                  <Suggestion.Item
                    key={item}
                    onSelect={() => {
                      setQuery(item);
                      setIsOpen(false);
                    }}
                  >
                    {item}
                  </Suggestion.Item>
                ))}
              </Suggestion.Group>
            </div>
          ))}
        </Suggestion>
      )}
    </div>
  );
}`,
    component: 'searchWithSuggestions',
    tags: ['search', 'autocomplete', 'filtering'],
  },

  // Data Table with Actions
  {
    id: 'table-actions',
    title: 'Data Table with Actions',
    description: 'Interactive table with sorting and actions.',
    code: `import { 
  Table, 
  Button, 
  Badge, 
  Pagination,
  Search 
} from '@xala/ds';
import { useState } from 'react';

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

export function Example() {
  const [data, setData] = useState(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
        />
      </div>
      
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {paginatedData.map(user => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>
                  {user.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      
      {totalPages > 1 && (
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}`,
    component: 'dataTable',
    tags: ['table', 'pagination', 'search', 'actions'],
  },

  // ContentLayout Examples (Composed)
  {
    id: 'content-layout-basic',
    title: 'Basic ContentLayout',
    description: 'Simple content layout with centered container and default settings.',
    code: `import { ContentLayout, Heading, Paragraph } from '@xala/ds';

export function Example() {
  return (
    <ContentLayout>
      <Heading size="lg">Welcome to our platform</Heading>
      <Paragraph>
        This content is automatically centered and has appropriate padding.
      </Paragraph>
    </ContentLayout>
  );
}`,
    component: 'contentLayout',
    tags: ['composed', 'layout', 'basic'],
  },
  {
    id: 'content-layout-grid',
    title: 'ContentLayout with Grid',
    description: 'Content layout with integrated grid system for card layouts.',
    code: `import { ContentLayout, Card, Heading, Paragraph } from '@xala/ds';

export function Example() {
  return (
    <ContentLayout
      grid={{
        columns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}
    >
      <Card>
        <Heading size="sm">Card 1</Heading>
        <Paragraph>Grid item content</Paragraph>
      </Card>
      <Card>
        <Heading size="sm">Card 2</Heading>
        <Paragraph>Grid item content</Paragraph>
      </Card>
      <Card>
        <Heading size="sm">Card 3</Heading>
        <Paragraph>Grid item content</Paragraph>
      </Card>
    </ContentLayout>
  );
}`,
    component: 'contentLayout',
    tags: ['composed', 'layout', 'grid'],
  },
  {
    id: 'content-layout-fluid',
    title: 'Fluid ContentLayout',
    description: 'Full-width layout without max-width constraint.',
    code: `import { ContentLayout, Card, Heading, Paragraph } from '@xala/ds';

export function Example() {
  return (
    <ContentLayout fluid padding="16px">
      <Card>
        <Heading size="md">Full-width layout</Heading>
        <Paragraph>
          This content stretches to fill the available width, useful for
          dashboards or data-heavy interfaces.
        </Paragraph>
      </Card>
    </ContentLayout>
  );
}`,
    component: 'contentLayout',
    tags: ['composed', 'layout', 'fluid'],
  },

  // ContentSection Examples (Composed)
  {
    id: 'content-section-basic',
    title: 'Basic ContentSection',
    description: 'Section component for grouping related content with a title.',
    code: `import { ContentSection, Field, Input } from '@xala/ds';

export function Example() {
  return (
    <ContentSection title="Personal Information">
      <Field>
        <Field.Label>Full Name</Field.Label>
        <Field.Input type="text" placeholder="Enter your name" />
      </Field>
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Input type="email" placeholder="name@example.com" />
      </Field>
    </ContentSection>
  );
}`,
    component: 'contentSection',
    tags: ['composed', 'section', 'form'],
  },
  {
    id: 'content-section-subtitle',
    title: 'ContentSection with Subtitle',
    description: 'Section with title and descriptive subtitle for additional context.',
    code: `import { ContentSection, Field, Input } from '@xala/ds';

export function Example() {
  return (
    <ContentSection
      title="Account Settings"
      subtitle="Update your account information and preferences"
    >
      <Field>
        <Field.Label>Username</Field.Label>
        <Field.Input type="text" placeholder="username" />
        <Field.Description>
          Choose a unique username for your account
        </Field.Description>
      </Field>
    </ContentSection>
  );
}`,
    component: 'contentSection',
    tags: ['composed', 'section', 'subtitle'],
  },
  {
    id: 'content-section-horizontal',
    title: 'Horizontal ContentSection',
    description: 'Horizontal layout with title on the left and content on the right.',
    code: `import { ContentSection, Field, Input, Button } from '@xala/ds';

export function Example() {
  return (
    <ContentSection
      title="Profile Photo"
      subtitle="Update your profile picture"
      horizontal
    >
      <Field>
        <Field.Input type="file" accept="image/*" />
        <Field.Description>
          Upload a square image at least 400x400 pixels
        </Field.Description>
      </Field>
      <Button variant="primary">Upload Photo</Button>
    </ContentSection>
  );
}`,
    component: 'contentSection',
    tags: ['composed', 'section', 'horizontal'],
  },

  // PageHeader Examples (Composed)
  {
    id: 'page-header-basic',
    title: 'Basic PageHeader',
    description: 'Simple page header with just a title.',
    code: `import { PageHeader } from '@xala/ds';

export function Example() {
  return <PageHeader title="Dashboard" />;
}`,
    component: 'pageHeader',
    tags: ['composed', 'header', 'basic'],
  },
  {
    id: 'page-header-actions',
    title: 'PageHeader with Actions',
    description: 'Page header with action buttons in the top-right.',
    code: `import { PageHeader, Button } from '@xala/ds';

export function Example() {
  return (
    <PageHeader
      title="Listings"
      subtitle="Manage your venue listings"
      actions={
        <>
          <Button variant="secondary">Export</Button>
          <Button variant="primary">Create Rental Object</Button>
        </>
      }
    />
  );
}`,
    component: 'pageHeader',
    tags: ['composed', 'header', 'actions'],
  },
  {
    id: 'page-header-breadcrumb',
    title: 'PageHeader with Breadcrumb',
    description: 'Page header with breadcrumb navigation for hierarchical pages.',
    code: `import { PageHeader } from '@xala/ds';

export function Example() {
  return (
    <PageHeader
      title="Edit Rental Object"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Rental Objects', href: '/rental-objects' },
        { label: 'Edit' }
      ]}
    />
  );
}`,
    component: 'pageHeader',
    tags: ['composed', 'header', 'breadcrumb'],
  },

  // ListingCard Examples (Blocks) - NOTE: ListingCard is a legacy name for displaying rental objects
  {
    id: 'listing-card-basic',
    title: 'Basic ListingCard',
    description: 'Simple rental object card with essential information.',
    code: `import { ListingCard } from '@xala/ds';

export function Example() {
  return (
    <ListingCard
      id="rental-object-1"
      name="Storsal A"
      type="Møterom"
      location="Oslo sentrum"
      description="Et romslig møterom perfekt for mindre møter og workshops."
      image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    />
  );
}`,
    component: 'listingCard',
    tags: ['blocks', 'card', 'rental-object'],
  },
  {
    id: 'listing-card-facilities',
    title: 'ListingCard with Facilities',
    description: 'Rental object card showing facilities and capacity information.',
    code: `import { ListingCard } from '@xala/ds';

export function Example() {
  return (
    <ListingCard
      id="rental-object-2"
      name="Konferanserom Bergen"
      type="Konferansesal"
      listingType="SPACE"
      location="Bergen, Vestland"
      description="Moderne konferanserom med alle fasiliteter du trenger."
      image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
      facilities={['WiFi', 'Projektor', 'Whiteboard', 'Videokonferanse']}
      capacity={20}
      showFacilities={true}
      showCapacity={true}
      showListingType={true}
    />
  );
}`,
    component: 'listingCard',
    tags: ['blocks', 'card', 'facilities'],
  },
  {
    id: 'listing-card-pricing',
    title: 'ListingCard with Pricing',
    description: 'Rental object card displaying price and currency information.',
    code: `import { ListingCard } from '@xala/ds';

export function Example() {
  return (
    <ListingCard
      id="rental-object-3"
      name="Studio Lydopptak"
      type="Lydstudio"
      listingType="RESOURCE"
      location="Trondheim"
      description="Profesjonelt lydstudio med førsteklasses utstyr."
      image="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"
      price={500}
      priceUnit="time"
      currency="kr"
      facilities={['Mikrofoner', 'Miksebord', 'Lydisolert']}
      capacity={4}
      showPrice={true}
      showFacilities={true}
      showCapacity={true}
    />
  );
}`,
    component: 'listingCard',
    tags: ['blocks', 'card', 'pricing'],
  },

  // BookingFormModal Examples (Blocks)
  {
    id: 'booking-form-modal-basic',
    title: 'Basic BookingFormModal',
    description: 'Simple booking form modal with date and time selection.',
    code: `import { BookingFormModal } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Book Now</button>
      <BookingFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        listingName="Konferanserom A"
        onSubmit={(data) => {
          console.log('Booking submitted:', data);
          setIsOpen(false);
        }}
      />
    </>
  );
}`,
    component: 'bookingFormModal',
    tags: ['blocks', 'modal', 'booking'],
  },
  {
    id: 'booking-form-modal-pricing',
    title: 'BookingFormModal with Pricing',
    description: 'Booking form modal showing pricing calculation.',
    code: `import { BookingFormModal } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Book with Pricing</button>
      <BookingFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        listingName="Studio B"
        price={500}
        priceUnit="time"
        currency="kr"
        showPricing={true}
        onSubmit={(data) => {
          console.log('Booking submitted:', data);
          setIsOpen(false);
        }}
      />
    </>
  );
}`,
    component: 'bookingFormModal',
    tags: ['blocks', 'modal', 'pricing'],
  },
  {
    id: 'booking-form-modal-services',
    title: 'BookingFormModal with Additional Services',
    description: 'Booking form with optional additional services selection.',
    code: `import { BookingFormModal } from '@xala/ds';
import { useState } from 'react';

export function Example() {
  const [isOpen, setIsOpen] = useState(false);

  const additionalServices = [
    { id: 'catering', name: 'Catering', price: 200 },
    { id: 'av-equipment', name: 'AV Equipment', price: 150 },
    { id: 'cleaning', name: 'Extra Cleaning', price: 100 },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Book with Services</button>
      <BookingFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        listingName="Event Hall"
        price={1500}
        priceUnit="day"
        currency="kr"
        additionalServices={additionalServices}
        showPricing={true}
        onSubmit={(data) => {
          console.log('Booking submitted:', data);
          setIsOpen(false);
        }}
      />
    </>
  );
}`,
    component: 'bookingFormModal',
    tags: ['blocks', 'modal', 'services'],
  },

  // AppShell Examples (Shells)
  {
    id: 'app-shell-basic',
    title: 'Basic AppShell',
    description: 'Simple application shell with just content area.',
    code: `import { AppShell, Heading, Paragraph } from '@xala/ds';

export function Example() {
  return (
    <AppShell>
      <Heading size="lg">Welcome</Heading>
      <Paragraph>This is your main content area.</Paragraph>
    </AppShell>
  );
}`,
    component: 'appShell',
    tags: ['shells', 'layout', 'basic'],
  },
  {
    id: 'app-shell-header',
    title: 'AppShell with Header',
    description: 'Application shell with header component.',
    code: `import { AppShell, AppHeader, ContentLayout, Heading } from '@xala/ds';

export function Example() {
  return (
    <AppShell
      header={
        <AppHeader
          logo={<img src="/logo.svg" alt="Logo" />}
          title="My Application"
        />
      }
    >
      <ContentLayout>
        <Heading size="lg">Dashboard</Heading>
      </ContentLayout>
    </AppShell>
  );
}`,
    component: 'appShell',
    tags: ['shells', 'layout', 'header'],
  },
  {
    id: 'app-shell-complete',
    title: 'Complete AppShell',
    description: 'Full application shell with header, footer, and content.',
    code: `import { AppShell, AppHeader, ContentLayout, PageHeader, Heading, Paragraph } from '@xala/ds';

export function Example() {
  return (
    <AppShell
      header={
        <AppHeader
          logo={<img src="/logo.svg" alt="Logo" />}
          title="My Application"
        />
      }
      footer={
        <footer style={{ padding: '24px', textAlign: 'center' }}>
          <Paragraph size="sm">© 2024 My Company</Paragraph>
        </footer>
      }
    >
      <ContentLayout>
        <PageHeader title="Dashboard" subtitle="Welcome back!" />
        <Heading size="md">Your Content</Heading>
      </ContentLayout>
    </AppShell>
  );
}`,
    component: 'appShell',
    tags: ['shells', 'layout', 'complete'],
  },
];

export function getAllExamples(): CodeExample[] {
  return [...componentExamples, ...patternExamples];
}

export function getExamplesByComponent(componentId: string): CodeExample[] {
  return getAllExamples().filter(example => example.component === componentId);
}

export function getExamplesByTag(tag: string): CodeExample[] {
  return getAllExamples().filter(example => 
    example.tags?.includes(tag)
  );
}

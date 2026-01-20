import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
} from '@xala/ds';
import { FileUploader } from '../../src/composed/FileUploader';
import { DateRangePicker } from '../../src/composed/DateRangePicker';
import { SearchableSelect } from '../../src/composed/SearchableSelect';
import { ColorPicker } from '../../src/composed/ColorPicker';
import type { UploadedFile } from '../../src/composed/FileUploader';
import type { DateRange } from '../../src/composed/DateRangePicker';
import type { SelectOption } from '../../src/composed/SearchableSelect';

/**
 * Advanced form components for complex data input scenarios.
 *
 * ## Components
 * - **FileUploader**: Drag-and-drop file upload with preview
 * - **DateRangePicker**: Date range selection with presets
 * - **SearchableSelect**: Searchable dropdown with filtering
 * - **ColorPicker**: Interactive color selection
 *
 * ## Features
 * - Accessibility compliant
 * - Norwegian localization
 * - Design system tokens
 */
const meta: Meta = {
  title: 'Composed/Forms',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Advanced form components for municipal applications.

## Typical Use Cases
- Document upload in booking forms
- Date range filtering for reports
- Category/tag selection
- Branding color configuration
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// =============================================================================
// Sample Data
// =============================================================================

const sampleSelectOptions: SelectOption[] = [
  { value: 'oslo', label: 'Oslo' },
  { value: 'bergen', label: 'Bergen' },
  { value: 'trondheim', label: 'Trondheim' },
  { value: 'stavanger', label: 'Stavanger' },
  { value: 'kristiansand', label: 'Kristiansand' },
  { value: 'tromso', label: 'Tromsø' },
  { value: 'drammen', label: 'Drammen' },
  { value: 'fredrikstad', label: 'Fredrikstad' },
];

const groupedSelectOptions: SelectOption[] = [
  { value: 'oslo', label: 'Oslo', group: 'Østlandet' },
  { value: 'drammen', label: 'Drammen', group: 'Østlandet' },
  { value: 'fredrikstad', label: 'Fredrikstad', group: 'Østlandet' },
  { value: 'bergen', label: 'Bergen', group: 'Vestlandet' },
  { value: 'stavanger', label: 'Stavanger', group: 'Vestlandet' },
  { value: 'trondheim', label: 'Trondheim', group: 'Midt-Norge' },
  { value: 'tromso', label: 'Tromsø', group: 'Nord-Norge' },
  { value: 'bodo', label: 'Bodø', group: 'Nord-Norge' },
];

const categoryOptions: SelectOption[] = [
  { value: 'idrettshall', label: 'Idrettshall' },
  { value: 'svommehall', label: 'Svømmehall' },
  { value: 'kulturhus', label: 'Kulturhus' },
  { value: 'bibliotek', label: 'Bibliotek' },
  { value: 'parker', label: 'Parker og friområder' },
  { value: 'motelokaler', label: 'Møtelokaler' },
];

const colorPresets = [
  '#0062BA', // Primary blue
  '#1E2B3C', // Dark navy
  '#00824D', // Success green
  '#C30000', // Error red
  '#FFBE3D', // Warning yellow
  '#7C3AED', // Purple
  '#0891B2', // Cyan
  '#EA580C', // Orange
];

const datePresets = [
  { label: 'I dag', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Siste 7 dager', getValue: () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return { from, to };
  }},
  { label: 'Siste 30 dager', getValue: () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  }},
  { label: 'Denne måneden', getValue: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from, to };
  }},
  { label: 'Forrige måned', getValue: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from, to };
  }},
  { label: 'Dette året', getValue: () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    return { from, to };
  }},
];

// =============================================================================
// FileUploader Stories
// =============================================================================

type FileUploaderStory = StoryObj<typeof FileUploader>;

/**
 * Basic file uploader with drag-and-drop
 */
export const FileUploaderDefault: FileUploaderStory = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
      <div style={{ maxWidth: '500px' }}>
        <FileUploader
          value={files}
          onChange={setFiles}
          accept="image/*,.pdf,.doc,.docx"
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
        />
      </div>
    );
  },
};

/**
 * File uploader with image preview
 */
export const FileUploaderWithPreview: FileUploaderStory = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
      <div style={{ maxWidth: '500px' }}>
        <FileUploader
          value={files}
          onChange={setFiles}
          accept="image/*"
          maxFiles={4}
          showPreview
          previewType="grid"
        />
      </div>
    );
  },
};

/**
 * File uploader with list preview
 */
export const FileUploaderListPreview: FileUploaderStory = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
      <div style={{ maxWidth: '500px' }}>
        <FileUploader
          value={files}
          onChange={setFiles}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          maxFiles={10}
          showPreview
          previewType="list"
        />
      </div>
    );
  },
};

/**
 * Single file upload
 */
export const FileUploaderSingle: FileUploaderStory = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
      <div style={{ maxWidth: '500px' }}>
        <FileUploader
          value={files}
          onChange={setFiles}
          accept="image/*"
          multiple={false}
          showPreview
        />
      </div>
    );
  },
};

/**
 * Disabled file uploader
 */
export const FileUploaderDisabled: FileUploaderStory = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <FileUploader
        value={[]}
        onChange={() => {}}
        disabled
      />
    </div>
  ),
};

/**
 * File uploader with upload progress
 */
export const FileUploaderWithUpload: FileUploaderStory = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (filesToUpload: File[]) => {
      setUploading(true);
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploading(false);
      console.log('Uploaded files:', filesToUpload.map(f => f.name));
    };

    return (
      <div style={{ maxWidth: '500px' }}>
        <FileUploader
          value={files}
          onChange={setFiles}
          onUpload={handleUpload}
          accept="image/*,.pdf"
          maxFiles={5}
          showPreview
        />
        {uploading && (
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
            Laster opp filer...
          </Paragraph>
        )}
      </div>
    );
  },
};

// =============================================================================
// DateRangePicker Stories
// =============================================================================

type DateRangePickerStory = StoryObj<typeof DateRangePicker>;

/**
 * Basic date range picker
 */
export const DateRangePickerDefault: DateRangePickerStory = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    return (
      <div style={{ maxWidth: '400px' }}>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          label="Velg periode"
          placeholder="Velg datoer"
        />
      </div>
    );
  },
};

/**
 * Date range picker with presets
 */
export const DateRangePickerWithPresets: DateRangePickerStory = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    return (
      <div style={{ maxWidth: '400px' }}>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          presets={datePresets}
          label="Rapportperiode"
          placeholder="Velg periode"
        />
      </div>
    );
  },
};

/**
 * Date range picker with min/max dates
 */
export const DateRangePickerConstrained: DateRangePickerStory = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    return (
      <div style={{ maxWidth: '400px' }}>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          minDate={minDate}
          maxDate={maxDate}
          label="Bookingperiode"
          placeholder="Velg datoer (maks 6 måneder)"
        />
        <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Velg datoer mellom {minDate.toLocaleDateString('nb-NO')} og {maxDate.toLocaleDateString('nb-NO')}
        </Paragraph>
      </div>
    );
  },
};

/**
 * Date range picker with initial value
 */
export const DateRangePickerWithValue: DateRangePickerStory = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange>({
      from: new Date(),
      to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return (
      <div style={{ maxWidth: '400px' }}>
        <DateRangePicker
          value={dateRange}
          onChange={(range) => range && setDateRange(range)}
          label="Filterperiode"
        />
      </div>
    );
  },
};

// =============================================================================
// SearchableSelect Stories
// =============================================================================

type SearchableSelectStory = StoryObj<typeof SearchableSelect>;

/**
 * Basic searchable select
 */
export const SearchableSelectDefault: SearchableSelectStory = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <div style={{ maxWidth: '300px' }}>
        <SearchableSelect
          options={sampleSelectOptions}
          value={value}
          onChange={(val) => setValue(val as string | null)}
          placeholder="Velg kommune..."
        />
      </div>
    );
  },
};

/**
 * Searchable select with groups
 */
export const SearchableSelectGrouped: SearchableSelectStory = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <div style={{ maxWidth: '300px' }}>
        <SearchableSelect
          options={groupedSelectOptions}
          value={value}
          onChange={(val) => setValue(val as string | null)}
          placeholder="Velg kommune..."
        />
      </div>
    );
  },
};

/**
 * Multi-select with search
 */
export const SearchableSelectMultiple: SearchableSelectStory = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);

    return (
      <div style={{ maxWidth: '400px' }}>
        <SearchableSelect
          options={categoryOptions}
          value={values}
          onChange={(val) => setValues(val as string[])}
          multiple
          placeholder="Velg kategorier..."
        />
        {values.length > 0 && (
          <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
            Valgt: {values.join(', ')}
          </Paragraph>
        )}
      </div>
    );
  },
};

/**
 * Searchable select with clear button
 */
export const SearchableSelectClearable: SearchableSelectStory = {
  render: () => {
    const [value, setValue] = useState<string | null>('oslo');

    return (
      <div style={{ maxWidth: '300px' }}>
        <SearchableSelect
          options={sampleSelectOptions}
          value={value}
          onChange={(val) => setValue(val as string | null)}
          clearable
          placeholder="Velg kommune..."
        />
      </div>
    );
  },
};

/**
 * Creatable searchable select
 */
export const SearchableSelectCreatable: SearchableSelectStory = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    const [options, setOptions] = useState(categoryOptions);

    const handleChange = (val: string | string[] | null) => {
      setValue(val as string | null);
    };

    const handleCreate = (inputValue: string) => {
      const newOption = { value: inputValue.toLowerCase(), label: inputValue };
      setOptions([...options, newOption]);
      setValue(newOption.value);
    };

    return (
      <div style={{ maxWidth: '300px' }}>
        <SearchableSelect
          options={options}
          value={value}
          onChange={handleChange}
          creatable
          onCreateOption={handleCreate}
          placeholder="Velg eller opprett kategori..."
        />
      </div>
    );
  },
};

/**
 * Searchable select with loading state
 */
export const SearchableSelectLoading: SearchableSelectStory = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<SelectOption[]>([]);

    const handleSearch = async (query: string) => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      // Simulate API search
      await new Promise(resolve => setTimeout(resolve, 500));

      const filtered = sampleSelectOptions.filter(opt =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );
      setOptions(filtered);
      setLoading(false);
    };

    return (
      <div style={{ maxWidth: '300px' }}>
        <SearchableSelect
          options={options}
          value={value}
          onChange={(val) => setValue(val as string | null)}
          loading={loading}
          onInputChange={handleSearch}
          placeholder="Søk etter kommune..."
        />
        <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Skriv minst 2 tegn for å søke
        </Paragraph>
      </div>
    );
  },
};

/**
 * Disabled searchable select
 */
export const SearchableSelectDisabled: SearchableSelectStory = {
  render: () => (
    <div style={{ maxWidth: '300px' }}>
      <SearchableSelect
        options={sampleSelectOptions}
        value="oslo"
        onChange={() => {}}
        disabled
        placeholder="Velg kommune..."
      />
    </div>
  ),
};

// =============================================================================
// ColorPicker Stories
// =============================================================================

type ColorPickerStory = StoryObj<typeof ColorPicker>;

/**
 * Basic color picker
 */
export const ColorPickerDefault: ColorPickerStory = {
  render: () => {
    const [color, setColor] = useState('#0062BA');

    return (
      <div style={{ maxWidth: '300px' }}>
        <ColorPicker
          value={color}
          onChange={setColor}
          label="Velg farge"
        />
      </div>
    );
  },
};

/**
 * Color picker with presets
 */
export const ColorPickerWithPresets: ColorPickerStory = {
  render: () => {
    const [color, setColor] = useState('#0062BA');

    return (
      <div style={{ maxWidth: '300px' }}>
        <ColorPicker
          value={color}
          onChange={setColor}
          presets={colorPresets}
          showPresets
          label="Merkefarge"
        />
      </div>
    );
  },
};

/**
 * Color picker with input field
 */
export const ColorPickerWithInput: ColorPickerStory = {
  render: () => {
    const [color, setColor] = useState('#7C3AED');

    return (
      <div style={{ maxWidth: '300px' }}>
        <ColorPicker
          value={color}
          onChange={setColor}
          showInput
          showPresets
          presets={colorPresets}
          label="Egendefinert farge"
        />
      </div>
    );
  },
};

/**
 * Color picker for theme configuration
 */
export const ColorPickerTheme: ColorPickerStory = {
  render: () => {
    const [primaryColor, setPrimaryColor] = useState('#0062BA');
    const [secondaryColor, setSecondaryColor] = useState('#1E2B3C');
    const [accentColor, setAccentColor] = useState('#00824D');

    return (
      <div style={{ maxWidth: '400px' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
            Temafarger
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <ColorPicker
              value={primaryColor}
              onChange={setPrimaryColor}
              presets={colorPresets}
              showPresets
              showInput
              label="Primærfarge"
            />

            <ColorPicker
              value={secondaryColor}
              onChange={setSecondaryColor}
              presets={colorPresets}
              showPresets
              showInput
              label="Sekundærfarge"
            />

            <ColorPicker
              value={accentColor}
              onChange={setAccentColor}
              presets={colorPresets}
              showPresets
              showInput
              label="Aksentfarge"
            />
          </div>

          <div style={{
            marginTop: 'var(--ds-spacing-5)',
            padding: 'var(--ds-spacing-4)',
            borderRadius: 'var(--ds-border-radius-md)',
            background: 'var(--ds-color-neutral-surface-subtle)'
          }}>
            <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
              Forhåndsvisning
            </Paragraph>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: primaryColor
              }} />
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: secondaryColor
              }} />
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: accentColor
              }} />
            </div>
          </div>
        </Card>
      </div>
    );
  },
};

// =============================================================================
// Combined Form Example
// =============================================================================

/**
 * Complete form with all components
 */
export const CompleteFormExample: StoryObj = {
  render: () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [locations, setLocations] = useState<string[]>([]);
    const [brandColor, setBrandColor] = useState('#0062BA');

    return (
      <div style={{ maxWidth: '600px' }}>
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="md" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
            Opprett arrangement
          </Heading>
          <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-6) 0', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Fyll ut skjemaet for å opprette et nytt arrangement
          </Paragraph>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)'
              }}>
                Kategori *
              </label>
              <SearchableSelect
                options={categoryOptions}
                value={category}
                onChange={(val) => setCategory(val as string | null)}
                placeholder="Velg kategori..."
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)'
              }}>
                Lokasjon(er)
              </label>
              <SearchableSelect
                options={groupedSelectOptions}
                value={locations}
                onChange={(val) => setLocations(val as string[])}
                multiple
                clearable
                placeholder="Velg kommuner..."
              />
            </div>

            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              presets={datePresets}
              label="Periode *"
              placeholder="Velg datoer"
            />

            <ColorPicker
              value={brandColor}
              onChange={setBrandColor}
              presets={colorPresets}
              showPresets
              showInput
              label="Arrangementsfarge"
            />

            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)'
              }}>
                Bilder og dokumenter
              </label>
              <FileUploader
                value={files}
                onChange={setFiles}
                accept="image/*,.pdf"
                maxFiles={5}
                showPreview
                previewType="grid"
              />
            </div>

            <div style={{
              display: 'flex',
              gap: 'var(--ds-spacing-3)',
              paddingTop: 'var(--ds-spacing-4)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)'
            }}>
              <Button variant="primary" onClick={() => console.log('Submit', { category, locations, dateRange, brandColor, files })}>
                Opprett arrangement
              </Button>
              <Button variant="secondary">
                Avbryt
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  },
};

/**
 * Booking filter form
 */
export const BookingFilterForm: StoryObj = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);

    const handleApplyFilters = () => {
      console.log('Filters:', { dateRange, categories, locations });
    };

    const handleClearFilters = () => {
      setDateRange(null);
      setCategories([]);
      setLocations([]);
    };

    return (
      <div style={{ maxWidth: '800px' }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--ds-spacing-4)',
            alignItems: 'end'
          }}>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              presets={datePresets.slice(0, 4)}
              label="Periode"
              placeholder="Alle datoer"
            />

            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)'
              }}>
                Kategorier
              </label>
              <SearchableSelect
                options={categoryOptions}
                value={categories}
                onChange={(val) => setCategories(val as string[])}
                multiple
                clearable
                placeholder="Alle kategorier"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)'
              }}>
                Kommuner
              </label>
              <SearchableSelect
                options={groupedSelectOptions}
                value={locations}
                onChange={(val) => setLocations(val as string[])}
                multiple
                clearable
                placeholder="Alle kommuner"
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            marginTop: 'var(--ds-spacing-4)',
            paddingTop: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)'
          }}>
            <Button variant="primary" onClick={handleApplyFilters}>
              Bruk filter
            </Button>
            <Button variant="tertiary" onClick={handleClearFilters}>
              Nullstill
            </Button>
          </div>
        </Card>
      </div>
    );
  },
};

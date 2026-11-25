# shadcn Components

Reusable React form fields distributed as individual [shadcn](https://ui.shadcn.com/) registry components.

## Installation

The consuming project must already be a React project with shadcn initialized. If it does not have a `components.json` file yet, initialize shadcn first:

```bash
pnpm dlx shadcn@latest init
```

Install any component directly from this GitHub registry with:

```bash
pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/<component-name>
```

The CLI copies the component source into the project and installs its declared shadcn and npm dependencies.

## Available components

| Component | Description | Install command |
| --- | --- | --- |
| `form-field-async-select` | Searchable, paginated select field for React Hook Form. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-async-select` |
| `form-field-checkbox` | React Hook Form checkbox field. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-checkbox` |
| `form-field-combobox` | Generic React Hook Form combobox field. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-combobox` |
| `form-field-date-input` | Date and time input field with calendar and time selection. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-date-input` |
| `form-field-date-picker` | Date picker with formatted text input. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-date-picker` |
| `form-field-infinite-scroll-select` | Select field backed by Inertia infinite scrolling. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-infinite-scroll-select` |
| `form-field-input` | React Hook Form input field with optional hint tooltip. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-input` |
| `form-field-multiselect` | Multi-value select field with expandable selected options. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-multiselect` |
| `form-field-pill-input` | Input field for editing an array of pill values. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-pill-input` |
| `form-field-search-select` | Searchable select field with optional clearing and value transformation. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-search-select` |
| `form-field-select` | Select field with optional search, clearing, and custom rendering. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-select` |
| `form-field-switch` | React Hook Form switch field. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-switch` |
| `form-field-tag-input` | Tag selection and creation field. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-tag-input` |
| `form-field-textarea` | React Hook Form textarea field. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-textarea` |
| `form-field-tinymce` | TinyMCE rich-text editor field. | `pnpm dlx shadcn@latest add P-C-ADMIN-22-LIMITED/shadcn-components/form-field-tinymce` |

## Usage

After installation, import the component from the path configured by the consuming project's shadcn aliases. In a standard Laravel project using this repository's configuration:

```tsx
import FormFieldInput from '@/components/form/form-field-input';
```

## Notes

- `types.ts` is not distributed as a separate component because it is a shared type module.
- The multiselect, pill-input, searchable-select, and date-picker packages include their custom local helper files automatically.
- `form-field-tinymce` also expects the consuming application to provide its media library and upload hook integration.

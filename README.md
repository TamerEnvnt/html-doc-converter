# HTML Document Converter

Convert HTML documents to PDF and DOCX with high fidelity.

- **PDF**: Pixel-perfect rendering using Chrome's print engine
- **DOCX**: Fully editable Word documents with real structure

## Installation

### Prerequisites

- Node.js 18+
- LibreOffice (for DOCX conversion)

#### Install LibreOffice

**macOS:**
```bash
brew install --cask libreoffice
```

**Ubuntu/Debian:**
```bash
sudo apt install libreoffice
```

**Windows:**
Download from https://www.libreoffice.org/download/ or use winget:
```bash
winget install LibreOffice.LibreOffice
```

### Install the Tool

```bash
npm install -g html-doc-converter
```

Or run directly with npx:
```bash
npx html-doc-converter document.html
```

## Usage

### Basic Usage

Convert to both PDF and DOCX:
```bash
html-doc-converter document.html
```

### Options

```
-o, --output <path>   Output file path (without extension)
-f, --format <fmt>    Output format: pdf, docx, or both (default: both)
--pdf-only            Generate PDF only
--docx-only           Generate DOCX only
--force               Overwrite existing output files
--timeout <ms>        Conversion timeout in milliseconds (default: 30000)
-v, --verbose         Enable verbose logging
-h, --help            Show help
-V, --version         Show version
```

### Examples

```bash
# Convert to both formats
html-doc-converter report.html

# PDF only
html-doc-converter report.html --pdf-only

# Custom output path
html-doc-converter report.html -o output/my-report

# DOCX only
html-doc-converter report.html -f docx

# Specific format via -f flag
html-doc-converter report.html -f pdf
```

### Check Dependencies

Verify your system has required dependencies:
```bash
html-doc-converter check
```

## Platform Notes

### macOS

- LibreOffice: `brew install --cask libreoffice`
- Chromium is bundled with Puppeteer (no separate install needed)

### Linux

- LibreOffice: Use your package manager
- You may need additional dependencies for Chromium:
  ```bash
  # Debian/Ubuntu
  sudo apt install libgbm1 libasound2
  ```

### Windows

- LibreOffice: Download installer from libreoffice.org
- Or use winget: `winget install LibreOffice.LibreOffice`
- Run from PowerShell or Command Prompt

## API Usage

Use as a library in your Node.js project:

```typescript
import {
  convertToPDF,
  convertToDOCX,
  parseDocument,
  closeBrowser
} from 'html-doc-converter';

// Convert to PDF
await convertToPDF('input.html', 'output.pdf');

// Convert to DOCX
const result = await convertToDOCX('input.html', 'output.docx');
if (result.success) {
  console.log('Created:', result.outputPath);
}

// Parse HTML structure
const doc = await parseDocument('input.html');
console.log('Title:', doc.title);
console.log('Chapters:', doc.chapters.length);
console.log('Metadata:', doc.metadata);

// IMPORTANT: Close browser when done (for PDF conversions)
await closeBrowser();
```

### PDF Options

```typescript
import { convertToPDF, PDFOptions } from 'html-doc-converter';

const options: PDFOptions = {
  format: 'A4',           // 'A4' | 'Letter' | 'Legal'
  landscape: false,
  printBackground: true,  // Include CSS backgrounds/colors
  preferCSSPageSize: true,
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  },
  displayHeaderFooter: false,
  headerTemplate: '',
  footerTemplate: '',
  scale: 1
};

await convertToPDF('input.html', 'output.pdf', options);
```

### Convert HTML String Directly

```typescript
import { convertHTMLStringToPDF, closeBrowser } from 'html-doc-converter';

const html = `
<!DOCTYPE html>
<html>
<head><title>My Doc</title></head>
<body><h1>Hello World</h1></body>
</html>
`;

await convertHTMLStringToPDF(html, 'output.pdf');
await closeBrowser();
```

## Troubleshooting

### LibreOffice not found

Run `html-doc-converter check` to see install instructions for your OS.

The tool searches for LibreOffice in standard locations:
- macOS: `/Applications/LibreOffice.app/Contents/MacOS/soffice`
- Linux: `/usr/bin/soffice`, `/usr/lib/libreoffice/program/soffice`
- Windows: `C:\Program Files\LibreOffice\program\soffice.exe`

### PDF missing colors/gradients

The tool uses `printBackground: true` by default. If colors are missing, ensure your HTML doesn't override print styles with `@media print` rules that hide colors.

### DOCX has text boxes instead of real paragraphs

This tool uses LibreOffice for conversion which preserves document structure. If you see text boxes, the HTML may have complex CSS positioning that doesn't translate well. Simplify the HTML structure if possible:

- Use semantic HTML (`<h1>`, `<p>`, `<table>`) instead of `<div>` with CSS
- Avoid absolute positioning
- Use simple layouts

### Puppeteer/Chromium issues on Linux

If you encounter Chromium launch errors on Linux, install the required dependencies:

```bash
# Debian/Ubuntu
sudo apt install -y libgbm1 libasound2 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libnss3 libxss1 libxtst6
```

### Conversion hangs or times out

- Ensure your HTML doesn't have external resources that are unavailable
- Check that LibreOffice isn't already running (it can lock the profile)
- Try closing other LibreOffice instances

## Security

This tool processes user-provided file paths and invokes external programs (Chromium, LibreOffice). The following protections are in place:

- **No shell injection**: All external processes use `execFile` (array-based argv), never shell string interpolation
- **Path traversal protection**: Input and output paths are validated against the working directory
- **Overwrite protection**: Existing files are not overwritten unless `--force` is passed
- **Input validation**: Timeout values and format options are validated before use

If you discover a security issue, please report it via [GitHub Issues](https://github.com/TamerEnvnt/html-doc-converter/issues).

## Development

```bash
# Clone repository
git clone https://github.com/TamerEnvnt/html-doc-converter.git
cd html-doc-converter

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type-check (source only)
npm run typecheck

# Type-check (source + tests)
npm run typecheck:tests

# Run in development
npm run dev document.html
```

## License

MIT

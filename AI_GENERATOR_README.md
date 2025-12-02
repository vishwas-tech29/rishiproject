# AI Business Automation - Quotation & Invoice Generator

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![AI](https://img.shields.io/badge/AI-Gemini%203.2-purple.svg)

## 🚀 Overview

A powerful, AI-driven quotation and invoice generator built with Google's Gemini 3.2 AI. This application automates the entire business documentation process, from project analysis to professional document generation.

## ✨ Features

### 🤖 AI-Powered Generation
- **Smart Quotation Creation**: AI analyzes project descriptions and generates detailed quotations
- **Intelligent Pricing**: Suggests realistic pricing based on project scope and budget
- **Auto-Enhancement**: AI improves and expands project descriptions
- **Template Library**: Pre-built templates for common project types

### 📄 Document Management
- **Quotation Generator**: Create professional quotations with AI assistance
- **Invoice Generator**: Generate detailed invoices with line items
- **Quick Conversion**: Convert quotations to invoices instantly
- **Document History**: Track all generated documents

### 💎 Premium Design
- **Modern UI/UX**: Glassmorphism and gradient effects
- **Dark Theme**: Easy on the eyes with vibrant accents
- **Smooth Animations**: Micro-interactions for enhanced UX
- **Responsive Design**: Works perfectly on all devices

### 🔧 Business Features
- **Line Item Management**: Add/remove items dynamically
- **Tax Calculations**: Automatic tax and discount calculations
- **Payment Terms**: Flexible payment term options
- **PDF Export**: Download documents as PDF
- **Local Storage**: All data saved locally for privacy

## 🎯 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Google Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd rishiproject
   ```

2. **Open the application**
   - Simply open `ai-generator.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

3. **Configure AI**
   - On first launch, you'll be prompted to enter your Gemini API key
   - Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - The key is stored locally in your browser

## 📖 Usage Guide

### Creating a Quotation

1. **Choose a Template** (Optional)
   - Click on one of the quick-start templates
   - Or write your own project description

2. **Describe Your Project**
   - Enter detailed project requirements
   - Specify target audience and tech stack
   - Use the "Enhance with AI" button to improve your description

3. **Add Client Information**
   - Client name and email
   - Company name
   - Budget range

4. **Generate**
   - Click "Generate AI Quotation"
   - AI will analyze and create a professional quotation
   - Preview appears in real-time

### Creating an Invoice

#### Method 1: Convert from Quotation
1. Go to the Invoice tab
2. Select a quotation from the dropdown
3. Click "Convert to Invoice"
4. Adjust details as needed
5. Generate invoice

#### Method 2: Create New Invoice
1. Fill in invoice details (number, dates)
2. Add client information
3. Add line items (description, quantity, rate)
4. Set tax and discount rates
5. Generate invoice

### Managing Documents

- **View History**: Click the History tab to see all documents
- **Filter**: Filter by quotations or invoices
- **View Document**: Click any card to view the full document
- **Download PDF**: Use the download button to save as PDF

## 🎨 Templates

### Web Development
Perfect for website projects with features like:
- Landing pages
- E-commerce sites
- Corporate websites
- Portfolio sites

### Mobile App
Ideal for mobile application projects:
- iOS and Android apps
- Cross-platform solutions
- React Native or Flutter apps

### AI Solution
For AI and ML projects:
- Machine learning models
- AI chatbots
- Predictive analytics
- NLP solutions

### Consulting
Professional consulting services:
- Business strategy
- Digital transformation
- Technology consulting
- Training and workshops

## 🔐 Privacy & Security

- **Local Storage**: All data is stored in your browser
- **No Server**: No data is sent to external servers (except AI API)
- **API Key Security**: Your API key is stored locally
- **No Tracking**: No analytics or tracking scripts

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Engine**: Google Gemini 3.2 Pro
- **Storage**: Browser LocalStorage
- **Fonts**: Inter, Space Grotesk (Google Fonts)
- **Icons**: Custom SVG icons

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🎨 Customization

### Changing Company Details

Edit the rendering functions in `ai-script.js`:

```javascript
// In renderQuotation() and renderInvoice()
<h1>Your Company Name</h1>
<p>Your Company Tagline</p>
```

### Modifying Color Scheme

Edit CSS variables in `ai-styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
    /* ... more colors */
}
```

### Adding Custom Templates

Add to the templates object in `ai-script.js`:

```javascript
'your-template': {
    description: 'Your template description...',
    budget: '25000-50000'
}
```

## 📊 Features Breakdown

| Feature | Quotation | Invoice |
|---------|-----------|---------|
| AI Generation | ✅ | ❌ |
| Manual Creation | ✅ | ✅ |
| Line Items | ✅ | ✅ |
| Tax Calculation | ❌ | ✅ |
| Discount | ❌ | ✅ |
| PDF Export | ✅ | ✅ |
| Email Send | 🔜 | 🔜 |

## 🚀 Roadmap

- [ ] Email integration for sending documents
- [ ] More AI models support (Claude, GPT-4)
- [ ] Multi-currency support
- [ ] Custom branding options
- [ ] Cloud sync (optional)
- [ ] Payment gateway integration
- [ ] Recurring invoices
- [ ] Client portal

## 💡 Tips & Best Practices

1. **Detailed Descriptions**: The more detailed your project description, the better the AI quotation
2. **Budget Range**: Providing a budget helps AI suggest realistic pricing
3. **Templates**: Use templates as starting points and customize them
4. **Regular Backups**: Export your documents regularly
5. **API Key**: Keep your API key secure and don't share it

## 🐛 Troubleshooting

### AI Not Working
- Check your API key is correct
- Ensure you have internet connection
- Verify API key has proper permissions

### Documents Not Saving
- Check browser storage permissions
- Clear browser cache if needed
- Try a different browser

### PDF Export Issues
- Use the browser's print dialog
- Try "Save as PDF" option
- Check printer settings

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- Google Fonts for beautiful typography
- The open-source community

## 📝 Changelog

### Version 1.0.0 (2025-12-02)
- Initial release
- AI-powered quotation generation
- Invoice creation and management
- Document history tracking
- PDF export functionality
- Template library
- Responsive design

---

**Built with ❤️ using AI and modern web technologies**

*Empowering businesses with intelligent automation*

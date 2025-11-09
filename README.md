# 🚗 EngineBlock 🚗

**Find your next car faster, and without distractions.**

Tired of scrolling through endless listings that don’t match what you’re looking for?

**EngineBlock** helps you take control of your search experience on [lacentrale.fr](https://www.lacentrale.fr).

This extension automatically hides any car listings that contain engines you’re not interested in, and it removes intrusive ads to keep the page clean and focused. No more wasted time, no more clutter, just the listings that matter to you.

**Key features:**

- ⚙️ **Custom filters:** Exclude specific engines, with ease.
- 🚫 **Ad cleanup:** Removes distracting banners and sponsored content.
- 🚀 **Lightweight & fast:** Runs seamlessly in the background without slowing down your browsing.
- 💡 **Personalized experience:** Fine-tune your search results to match your exact preferences.

## Installing

### Firefox Extension

<a href="https://addons.mozilla.org/fr/firefox/addon/engineblock/" target="_blank"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get EngineBlock for Firefox"></a>

### Userscript

#### Prerequisites

- A compatible web browser (Google Chrome, Firefox, Edge, etc.).
- The **Tampermonkey** extension installed.

#### Installing Tampermonkey

- **Google Chrome**: Go to the  [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?pli=1) and click "Add to Chrome."
- **Firefox**: Go to [Mozilla Add-ons](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/) and click "Add to Firefox."
- **Other browsers**: Search for "Tampermonkey" in your browser's extension store (Edge, Opera, etc.).

#### Installing the EngineBlock script

1. **From Greasyfork:**
    - Go to the script page: [EngineBlock](https://greasyfork.org/fr/scripts/555260-engineblock)
    - Click on "Install this script" and confirm

2. **From Github:**
   - Click here: [EngineBlock.user.js](https://github.com/Hogwai/EngineBlock/raw/refs/heads/main/EngineBlock.user.js) and confirm.

3. **Check that the script is enabled:**
   - In the Tampermonkey dashboard (click on the icon > "Dashboard"), make sure that the `EngineBlock` script is enabled (switch set to "On").

#### Usage

- Visit [lacentrale.fr/listing](https://www.lacentrale.fr/listing).
- The script runs automatically and removes:
- Vehicle ads containing "PURETECH," "VTI," or "THP."
- Front-page ads (`.lcui-AdPlaceholder`) and intermediate ads (`.appNexusPlaceholder`).
- Open the browser console (`F12` > Console) to view the logs (e.g., how many ads or advertisements have been removed).

#### Customization

You can add engines by putting elements in the `VEHICLE_KEYWORDS` array:

```javascript
const VEHICLE_KEYWORDS = ['PURETECH', 'VTI', 'THP', 'TFSI', 'DCI'];
```

#### Troubleshooting

- **The script isn't working?**
  - Check that Tampermonkey is enabled and that the script is installed correctly.
  - Make sure the site URL matches the script's `@match` patterns (`https://lacentrale.fr/*` or `https://www.lacentrale.fr/*`).
  - Check the browser console for error messages.

- **Persistent issues?**
  - Contact the author via [GitHub](https://github.com/Hogwai/EngineBlock/) or update the script.

## Author

- **Hogwai** - [GitHub](https://github.com/Hogwai)

## License

This project is licensed under MIT license

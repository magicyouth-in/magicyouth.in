import { chromium } from 'playwright';

async function verifyPages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const pagesToCheck = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/programs', name: 'Programs' },
    { path: '/chapters', name: 'Chapters' },
    { path: '/impact', name: 'Impact' },
    { path: '/media', name: 'Media' },
    { path: '/stories', name: 'Stories' },
    { path: '/teams', name: 'Teams' },
    { path: '/contact', name: 'Contact' }
  ];

  const results = [];

  for (const p of pagesToCheck) {
    const url = `https://magicyouth-in.vercel.app${p.path}`;
    console.log(`Checking ${p.name} at ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Check Footer existence and details
      const footerExists = await page.locator('footer').count() > 0;
      const footerText = footerExists ? await page.locator('footer').innerText() : '';
      const hasSecretariat = footerText.includes('YES-J Centre for Excellence') || footerText.includes('Andhra Loyola College');
      const hasPhone = footerText.includes('+91-868-672-7202') || footerText.includes('868-672-7202');
      
      // Check if there is any unwanted pre-footer CTA like "Submit your student leadership" or "Ready to lead or participate"
      const pageContent = await page.content();
      const hasSubmitStoryCTA = pageContent.includes('Submit your student leadership or community engagement reflection');
      const hasReadyToLeadCTA = pageContent.includes('Ready to lead or participate in a program');
      
      results.push({
        name: p.name,
        path: p.path,
        status: 'PASS',
        footerExists,
        hasSecretariat,
        hasPhone,
        hasSubmitStoryCTA,
        hasReadyToLeadCTA
      });
    } catch (e) {
      results.push({
        name: p.name,
        path: p.path,
        status: 'FAIL',
        error: e.message
      });
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

verifyPages();

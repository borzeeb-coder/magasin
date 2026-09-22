const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  await page.goto('http://127.0.0.1:8123/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1000);
  
  // Go to Recettes (Menu Hebdo is now integrated there)
  await page.click('.navbtn[data-view="recettes"]');
  await page.waitForTimeout(800);
  
  // Wait for gallery to have cards
  await page.waitForFunction(() => document.querySelectorAll('#menuGallery .pcard').length > 0, {timeout:5000});
  await page.waitForTimeout(300);
  
  // Click first recipe image in the gallery
  const firstImg = await page.$('#menuGallery .pcard-img img');
  if(firstImg){
    const src = await firstImg.getAttribute('src');
    console.log('First image src:', src);
    await firstImg.click();
    await page.waitForTimeout(300);
    
    // Check lightbox opened
    const lightbox = await page.$('#imageLightbox.show');
    console.log('Lightbox opened:', !!lightbox);
    
    if(lightbox){
      const lbImg = await page.$('#lightboxImg');
      const lbSrc = await lbImg.getAttribute('src');
      console.log('Lightbox image src matches:', lbSrc === src);
      const info = await page.$eval('#lightboxInfo', el => el.textContent);
      console.log('Lightbox info:', info);
      
      // Close lightbox by clicking overlay
      await page.click('#imageLightbox', {position: {x: 10, y: 10}});
      await page.waitForTimeout(300);
      const lightboxClosed = await page.$('#imageLightbox.show');
      console.log('Lightbox closed:', !lightboxClosed);
    }
  }
  
  console.log('JS Errors:', errors.filter(e=>!e.includes('intermediate value')));
  await browser.close();
})();
const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  await page.goto('http://127.0.0.1:8123/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1000);
  
  // Go to Recettes (Menu Hebdo)
  await page.click('.navbtn[data-view="recettes"]');
  await page.waitForTimeout(500);
  
  // Wait for Menu Hebdo to load
  await page.waitForSelector('#menuWeek', {timeout:5000});
  await page.waitForTimeout(300);
  
  // Measure dimensions BEFORE auto-choisir
  const before = await page.evaluate(() => {
    const days = document.querySelectorAll('.menu-day');
    return Array.from(days).map(d => ({
      height: d.offsetHeight,
      width: d.offsetWidth,
      innerHTML: d.innerHTML.length
    }));
  });
  console.log('BEFORE auto-choisir:', before.map(d => d.height + 'x' + d.width));
  
  // Click Auto-choisir
  const autoBtn = await page.$('button:has-text("Auto-choisir")');
  if(autoBtn){
    await autoBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Measure dimensions AFTER auto-choisir
  const after = await page.evaluate(() => {
    const days = document.querySelectorAll('.menu-day');
    return Array.from(days).map(d => ({
      height: d.offsetHeight,
      width: d.offsetWidth,
      innerHTML: d.innerHTML.length
    }));
  });
  console.log('AFTER auto-choisir:', after.map(d => d.height + 'x' + d.width));
  
  // Check if dimensions changed
  const dimsChanged = before.some((b, i) => b.height !== after[i].height || b.width !== after[i].width);
  console.log('Dimensions changed:', dimsChanged);
  
  console.log('JS Errors:', errors.filter(e=>!e.includes('intermediate value')));
  await browser.close();
})();
const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  await page.goto('http://127.0.0.1:8123/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1000);
  
  await page.click('.navbtn[data-view="recettes"]');
  await page.waitForTimeout(500);
  await page.waitForSelector('#menuWeek', {timeout:5000});
  await page.waitForTimeout(300);
  
  const autoBtn = await page.$('button:has-text("Auto-choisir")');
  if(autoBtn){
    await autoBtn.click();
    await page.waitForTimeout(500);
  }
  
  const addBtn = await page.$('#menuAddToCartBtn');
  if(addBtn){
    await addBtn.click();
    await page.waitForTimeout(1000);
  }
  
  await page.click('.navbtn[data-view="cart"]');
  await page.waitForTimeout(500);
  
  // Get all cart lines with their text
  const lines = await page.$$('.cart-line');
  for(let i=0; i<lines.length; i++){
    const text = await lines[i].textContent();
    const className = await lines[i].getAttribute('class');
    console.log(`Line ${i}: [${className}] ${text.trim().substring(0, 100)}`);
  }
  
  // Check for store heads
  const heads = await page.$$('.cart-store-head');
  for(let i=0; i<heads.length; i++){
    const text = await heads[i].textContent();
    console.log(`Store head ${i}:`, text.trim());
  }
  
  // Check for virtual items
  const virtualItems = await page.$$('.cart-line');
  for(let i=0; i<virtualItems.length; i++){
    const text = await virtualItems[i].textContent();
    if(text.includes('🥘') || text.includes('estimé')){
      console.log('Virtual item:', text.trim().substring(0, 100));
    }
  }
  
  console.log('JS Errors:', errors.filter(e=>!e.includes('intermediate value')));
  await browser.close();
})();
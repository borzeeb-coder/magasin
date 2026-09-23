const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  await page.goto('http://127.0.0.1:8123/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1000);
  
  // Go to Recettes
  await page.click('.navbtn[data-view="recettes"]');
  await page.waitForTimeout(500);
  
  // Wait for Menu Hebdo to load
  await page.waitForSelector('#menuWeek', {timeout:5000});
  await page.waitForTimeout(300);
  
  // Click Auto-choisir
  const autoBtn = await page.$('button:has-text("Auto-choisir")');
  if(autoBtn){
    await autoBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Click Add to Cart button
  const addBtn = await page.$('#menuAddToCartBtn');
  if(addBtn){
    await addBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Go to Cart
  await page.click('.navbtn[data-view="cart"]');
  await page.waitForTimeout(500);
  
  // Check cart contents
  const cartItems = await page.$$('.cart-line');
  console.log('Cart items count:', cartItems.length);
  
  for(const item of cartItems){
    const text = await item.textContent();
    console.log('Cart item:', text.trim().substring(0, 80));
  }
  
  console.log('JS Errors:', errors.filter(e=>!e.includes('intermediate value')));
  await browser.close();
})();
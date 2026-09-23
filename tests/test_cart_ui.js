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
  
  // Check if toast appears
  const toastBefore = await page.$('.toast.show');
  console.log('Toast before:', !!toastBefore);
  
  // Click Add to Cart button
  const addBtn = await page.$('#menuAddToCartBtn');
  if(addBtn){
    await addBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Check for toast
  const toastAfter = await page.$('.toast.show');
  console.log('Toast after:', !!toastAfter);
  if(toastAfter){
    const toastText = await toastAfter.textContent();
    console.log('Toast text:', toastText);
  }
  
  // Go to Cart and check items
  await page.click('.navbtn[data-view="cart"]');
  await page.waitForTimeout(500);
  
  const cartItems = await page.$$('.cart-line');
  console.log('Cart items count:', cartItems.length);
  
  // Check if cart is scrolled to top
  const cartList = await page.$('#cartList');
  if(cartList){
    const scrollTop = await cartList.evaluate(el => el.scrollTop);
    console.log('Cart scrollTop:', scrollTop);
  }
  
  console.log('JS Errors:', errors.filter(e=>!e.includes('intermediate value')));
  await browser.close();
})();
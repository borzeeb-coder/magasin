const {chromium} = require('playwright');
(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  await page.goto('http://127.0.0.1:8123/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1000);
  
  // Navigate to Menu Hebdo
  await page.click('.navbtn[data-view="menuhebdo"]');
  await page.waitForTimeout(500);
  
  // Test budget slider
  const range = await page.$('#menuBudgetRange');
  await range.fill('80');
  await page.waitForTimeout(300);
  const budgetVal = await page.$eval('#menuBudgetValue', el => el.textContent);
  console.log('Budget value after change:', budgetVal);
  
  // Check gallery updated
  await page.waitForTimeout(300);
  const cards = await page.$$('.pcard');
  console.log('Recipe cards in gallery:', cards.length);
  
  // Click first recipe to add to Monday
  const firstAddBtn = await page.$('.pcard-add:not(.in-cart)');
  if(firstAddBtn){
    await firstAddBtn.click();
    await page.waitForTimeout(300);
    const mondaySlot = await page.$('.menu-day:first-child .menu-day-thumb');
    console.log('Monday has recipe thumb:', !!mondaySlot);
    const summaryVisible = await page.$eval('#menuSummary', el => el.style.display);
    console.log('Summary visible:', summaryVisible);
  }
  
  // Test budget filter - lower budget
  const range2 = await page.$('#menuBudgetRange');
  await range2.fill('25');
  await page.waitForTimeout(300);
  const cards2 = await page.$$('.pcard');
  console.log('Recipe cards at 25€ budget:', cards2.length);
  
  console.log('JS Errors:', errors.filter(e=>!e.includes('intermediate value')));
})();
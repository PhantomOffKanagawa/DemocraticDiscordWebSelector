const {By, Builder, Browser, until} = require('selenium-webdriver');

async function controller() {
    driver = await new Builder().forBrowser('firefox').build();

    await driver.get('https://openpsychometrics.org/tests/characters/');
    await driver.wait(until.elementLocated(By.id('Trait1')));

    getPageInfo(driver);

    // await driver.quit()
}

async function getPageInfo(driver) {
    let Trait1 = await driver.findElement(By.id('Trait1'));
    let Trait2 = await driver.findElement(By.id('Trait2'));
    let slider = await driver.findElement(By.id('trait_scale'));

    console.log(`Comparing ${await Trait1.getText()} and ${await Trait2.getText()}`)
    console.log(`Slider value is: ${await slider.getAttribute("value")}`)
    await driver.executeScript("document.getElementById('trait_scale').value = " + 25)
    // await slider.sendKeys("value", "25");
    console.log(`Slider value is now: ${await slider.getAttribute("value")}`)
}

controller();

process.on('exit', function () {
    if (driver) {
        driver.quit();
    }
});
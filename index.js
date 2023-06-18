const { By, Builder, Browser, until } = require('selenium-webdriver')
const { Client, Events, GatewayIntentBits } = require('discord.js')
const dotenv = require('dotenv')

dotenv.config()
let driver,
  lastChoice1 = ''
let votes = {}

async function webController () {
  driver = await new Builder().forBrowser('firefox').build()

  await driver.get('https://openpsychometrics.org/tests/characters/')
  await driver.wait(until.elementLocated(By.id('Trait1')))

  await getPageInfo(driver)

  // await driver.quit()
}

async function getPageInfo (driver) {
  let Trait1 = await driver.findElement(By.id('Trait1'))
  let Trait2 = await driver.findElement(By.id('Trait2'))
  let slider = await driver.findElement(By.id('trait_scale'))

  console.log(
    `Comparing ${await Trait1.getText()} and ${await Trait2.getText()}`
  )

  console.log(`Slider value is: ${await slider.getAttribute('value')}`)
  await driver.executeScript(
    "document.getElementById('trait_scale').value = " + 25
  )
  console.log(`Slider value is now: ${await slider.getAttribute('value')}`)
}

async function updateSlider (name, value) {
  // Test if on a screen with a trait slider
  try {
    await driver.findElement(By.id('trait_scale'))
  } catch (NoSuchElementError) {
    console.log('Invalid Voting')
    return
  }

  // If a new page then reset the votes object
  const choice1 = await driver.findElement(By.id('Trait1')).getText()
  if (choice1 != lastChoice1) {
    votes = {}
    lastChoice1 = choice1
  }

  // Set new vote
  votes[name] = value
  let avg = 0,
    count = 0

  console.log(JSON.stringify(votes));

  // Find new average
  for (let voteVal of Object.values(votes)) {
    console.log(`A voteVal is: ${voteVal}`)
    avg += voteVal
    count++
  }
  avg /= count
  console.log(`Average is: ${avg}`)

  // Set the slider to the new average
  await driver.executeScript(
    "document.getElementById('trait_scale').value = " + parseInt(avg)
  )
}

async function discordBotInit () {
  // Create a new client instance
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })

  client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
  })

  client.on(Events.MessageCreate, async message => {
    if (message.channel.id === process.env.DISCORD_CHANNEL) {
      if (message.content <= 100 && message.content >= 0) {
        let val = parseInt(message.content)
        console.log(`${val} from: ${message.author.username}`)
        await updateSlider(message.author.username, val)
      }
    }
  })

  await client.login(process.env.DISCORD_TOKEN)
}

async function main () {
  await discordBotInit()
  await webController()
}

main()

process.on('exit', function () {
  if (driver) {
    driver.quit()
  }
})

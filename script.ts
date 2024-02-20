import { cleanPrice } from './cleanPrice.js'

const chartDiv = document.getElementById('chart') as HTMLDivElement
const selectChart = document.getElementById('currency') as HTMLSelectElement
let listArray: Object[] = []
let chartArray: any = []

const headers = new Headers({
	'Accept-Encoding': 'gzip'
})

const chartHeaders = new Headers({
	'Accept-Encoding': 'deflate'
})

const assetsUrl = 'https://api.coincap.io/v2/assets'
const priceChartChange = 'https://api.coincap.io/v2/assets/bitcoin/history?interval=d1'

async function getData(targetArray: any, url: string): Promise<void> {
	try {
		const result: Response = await fetch(url, { method: 'GET', headers: headers })
		targetArray = await result.json() // Change from any[] to any
		renderList(targetArray)
	} catch (error) {
		console.log(error)
	}
}

async function getChart(targetArray: any, id: string) {
	targetArray = ''
	const priceChartChange = `https://api.coincap.io/v2/assets/${id}/history?interval=d1`
	try {
		const result: Response = await fetch(priceChartChange, { method: 'GET', headers: chartHeaders })
		targetArray = await result.json()
		console.log(targetArray.data)
		drawchart(targetArray)
	} catch (error) {
		console.log(error)
	}
}

function renderList(data: any) {
	const ArDat = data.data

	ArDat.forEach((coin: any) => {
		const coinDiv = document.createElement('div') as HTMLDivElement
		const name = document.createElement('h1') as HTMLHeadingElement
		const symbol = document.createElement('h2') as HTMLHeadingElement
		const priceUsd = document.createElement('h3') as HTMLHeadingElement
		const priceChange = document.createElement('H3') as HTMLHeadingElement
		const option = document.createElement('option') as HTMLOptionElement

		option.textContent = coin.name
		option.value = coin.id
		selectChart.append(option)
		// logic
		const priceChangeNum = parseFloat(cleanPrice(coin.changePercent24Hr, 3))

		if (priceChangeNum > 0) {
			priceChange.style.color = 'green'
		} else {
			priceChange.style.color = 'red'
		}
		//id - classes
		coinDiv.id = 'coin-div'
		// text
		priceChange.textContent = `${cleanPrice(coin.changePercent24Hr, 2)}%`
		name.textContent = coin.name
		symbol.textContent = coin.symbol
		priceUsd.textContent = `${cleanPrice(coin.priceUsd, 3)} USD`
		// style
		priceUsd.style.color = 'rgb(255,134,0)'
		coinDiv.append(name, symbol, priceUsd, priceChange)
		document.body.append(coinDiv)
	})
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement
let context = canvas.getContext('2d')

canvas.width = window.innerWidth * 0.7
canvas.height = window.innerHeight * 0.7

const drawchart = (array: any) => {
	context.setTransform(1, 0, 0, 1, 0, 0) // set to indentity
	context.clearRect(0, 0, canvas.width, canvas.height) // clear
	context.clearRect(0, 0, innerWidth, innerHeight)

	let data = array.data
	let prices = data.map((element: any) => parseFloat(element.priceUsd))
	let max = Math.max(...prices)
	let min = Math.min(...prices)

	const canvasHeight = canvas.height
	const startValue = canvasHeight - ((parseFloat(data[0].priceUsd) - min) / (max - min)) * canvasHeight
	const distance = canvas.width / data.length
	const startPoint = 0

	context.beginPath()
	context.moveTo(startPoint, startValue)
	context.strokeStyle = 'rgb(255,255,255)'

	data.forEach((element: any, index: number) => {
		const newDistance = startPoint + distance * (index + 1)
		const normalizedValue = canvasHeight - ((parseFloat(element.priceUsd) - min) / (max - min)) * canvasHeight

		context.lineTo(newDistance, normalizedValue)
	})

	context.lineTo(canvas.width, canvas.height)
	context.lineTo(startPoint, canvas.height)
	context.lineTo(startPoint, startValue)

	const grd = context.createLinearGradient(0, 0, canvas.width / 2, 0)
	grd.addColorStop(0, 'rgb(114,0,255)')
	grd.addColorStop(1, 'rgba(0,222,170,0.42)')

	// Fill with gradient
	context.fillStyle = grd
	context.fill()
	context.stroke()

	for (let i = 0; i < 20; i++) {
		const price = min + (max - min) * (i / 19)
		const showPrice = document.createElement('h3') as HTMLHeadingElement

		showPrice.textContent = `${cleanPrice(price.toString(), 2)} USD`
		showPrice.style.position = 'absolute'
		showPrice.style.color = 'rgb(111,111,111)'
		showPrice.style.bottom = `${(100 / 20) * i}%`
		showPrice.style.left = `-15%`

		chartDiv.append(showPrice)

		selectChart.addEventListener('change', () => {
			getChart(chartArray, selectChart.value)
		})
	}
}

getData(listArray, assetsUrl)
getChart(chartArray, 'bitcoin')

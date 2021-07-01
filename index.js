import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'

const form = document.querySelector('[data-form]')


const queryParamsContainer = document.querySelector('[data-query-params]')
const requestHeadersContainer = document.querySelector('[data-request-headers]')
const keyValueTemplate = document.querySelector('[data-key-value-template]')

const responseHeadersContainer = document.querySelector('[data-response-headers]')
const responseBodyContainer = document.querySelector('[data-json-response-body]')

const responseStatusContainer = document.querySelector('[data-status]')
const responseTimeContainer = document.querySelector('[data-time]')
const responseSizeContainer = document.querySelector('[data-size]')


axios.interceptors.request.use(request => {
    request.customData = request.customData || {}
    request.customData.startTime = new Date().getTime()
    return request
})

axios.interceptors.response.use(updateEndTime, e => {
    return Promise.reject(updateEndTime(e.response))
})

function updateEndTime(response) {
    response.customData = response.customData || {}
    response.customData.time = new Date().getTime() - response.config.customData.startTime
    return response
}

form.addEventListener('submit', (e) => {
    e.preventDefault()

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-method]').value,
        params: keyValuePairsToObjects(queryParamsContainer),
        headers: keyValuePairsToObjects(requestHeadersContainer)
    }).catch(e => e).then(response => {
        console.log('response', response)
        document.querySelector('[data-response-section]').classList.remove('d-none')
        updateResponseBody(response.data)
        // updateResponseEditor(response.data)
        updateResponseHeaders(response.headers)
        updateResponseDetails(response)
    })

})

function updateResponseHeaders(headers) {
    responseHeadersContainer.innerHTML = ''
    console.log('headers', headers)
    Object.entries(headers).forEach(([key, value]) => {
        const keyElement = document.createElement('div')
        keyElement.textContent = key
        responseHeadersContainer.append(keyElement)
        const valueElement = document.createElement('div')
        valueElement.textContent = value
        responseHeadersContainer.append(valueElement)
    })
}

function updateResponseBody(body) {
    responseBodyContainer.innerHTML = ''
    console.log('body', body)
    Object.entries(body).forEach(([key, value]) => {
        const keyElement = document.createElement('div')
        keyElement.textContent = key
        responseBodyContainer.append(keyElement)
        const valueElement = document.createElement('div')
        valueElement.textContent = value
        responseBodyContainer.append(valueElement)
    })
}

function updateResponseDetails(response) {
    responseStatusContainer.textContent = response.status
    responseTimeContainer.textContent = response.customData.time
    responseSizeContainer.textContent = prettyBytes(
        JSON.stringify(response.data).length + JSON.stringify(response.headers).length
    )
}


document.querySelector('[data-add-query-param-btn]').addEventListener('click', ()=> {
    queryParamsContainer.append(createKeyValuePair())
})

document.querySelector('[data-add-request-headers-btn]').addEventListener('click', ()=> {
    requestHeadersContainer.append(createKeyValuePair())
})

queryParamsContainer.append(createKeyValuePair())
requestHeadersContainer.append(createKeyValuePair())

function createKeyValuePair() {
    const element = keyValueTemplate.content.cloneNode(true)
    element.querySelector('[data-remove-btn]').addEventListener('click', (e) => {
        e.target.closest('[data-key-value-pair]').remove()
    })
    return element
}

function keyValuePairsToObjects(container) {
    const pairs = container.querySelectorAll('[data-key-value-pair]')
    let objects =  [...pairs].reduce((data, pair) => {
        const key = pair.querySelector('[data-key]').value
        const value = pair.querySelector('[data-value]').value

        if (key === '') return data
        return {...data, [key]: value }
    }, {})
    return objects
}
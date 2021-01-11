const xml2js = require('xml2js')
const axios = require('axios')

console.log('library thing connector loading...')

const URL = 'http://www.librarything.com/api/thingISBN/'

/**
 * Gets a set of ISBNs relating to a single ISBN from the library thing thingISBN service
 * @param {string} isbn
 */
exports.thingISBN = async (isbn) => {
  const responseISBNs = { isbns: [] }

  const isbnRequest = await axios.get(URL + isbn, { timeout: 1000 })

  const isbnJs = await xml2js.parseStringPromise(isbnRequest.data)
  const isbns = isbnJs.idlist.isbn
  if (isbns) isbns.forEach((item) => responseISBNs.isbns.push(item))

  return responseISBNs
}

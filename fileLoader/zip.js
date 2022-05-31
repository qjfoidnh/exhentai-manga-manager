const fs = require('fs')
const path = require('path')
const glob = require('glob')
const {promisify} = require('util')
const AdmZip = require('adm-zip')

let getZipFilelist = async (libraryPath)=>{
  return await promisify(glob)('**/*.zip', {
    cwd: libraryPath,
    nocase: true
  })
}

let solveBookTypeZip = async (filepath, id, TEMP_PATH, COVER_PATH)=>{
  let zip = new AdmZip(filepath)
  let zipFileList = zip.getEntries()
  let tempCoverPath
  let coverPath
  if (zipFileList[0].isDirectory) {
    zip.extractEntryTo(zipFileList[0], TEMP_PATH)
    let subFileList = await fs.promises.readdir(path.join(TEMP_PATH, zipFileList[0].entryName))
    subFileList = subFileList.sort((a,b)=>a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
    tempCoverPath = path.join(TEMP_PATH, id + path.extname(subFileList[0]))
    await fs.promises.rename(path.join(TEMP_PATH, zipFileList[0].entryName, subFileList[0]), tempCoverPath)
    await fs.promises.rm(path.join(TEMP_PATH, zipFileList[0].entryName), {recursive: true})
    coverPath = path.join(COVER_PATH, id + path.extname(subFileList[0]))
  } else {
    zipFileList = zipFileList.sort((a,b)=>a.entryName.localeCompare(b.entryName, undefined, {numeric: true, sensitivity: 'base'}))
    zip.extractEntryTo(zipFileList[0], TEMP_PATH)
    tempCoverPath = path.join(TEMP_PATH, id + path.extname(zipFileList[0].entryName))
    await fs.promises.rename(path.join(TEMP_PATH, zipFileList[0].entryName), tempCoverPath)
    coverPath = path.join(COVER_PATH, id + path.extname(zipFileList[0].entryName))
  }

  return {tempCoverPath, coverPath}
}

let getImageListFromZip = async (filepath, VIEWER_PATH)=>{
  let zip = new AdmZip(filepath)
  zip.extractAllTo(VIEWER_PATH, true)
  return await promisify(glob)('**/*.@(jpg|jpeg|png|gif|webp|bmp)', {
    cwd: VIEWER_PATH,
    nocase: true
  })
}

module.exports = {
  getZipFilelist,
  solveBookTypeZip,
  getImageListFromZip
}
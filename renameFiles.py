import glob 
import musicbrainzngs as mb
from time import sleep
import os

rootDir = '/media/harmly/158a5553-2d82-4bd9-9472-fc1cbf45e4b3/fileRenameTesting'

def GetAllFiles():
    files = glob.glob(rootDir + '/**/*.flac', recursive=True)
    return files

def GetMBLookupTerms(filePath):
    splitString = filePath.split('/')
    artistName = splitString[5]
    albumName = splitString[6]
    return artistName, albumName

def MBLookup(artistName):
    mb.set_useragent("HTV", "1.0", "h4rmly@proton.me")
    result = mb.search_artists(artistName)
    artist = result['artist-list'][0]
    artistData = mb.get_artist_by_id(artist['id'], includes=['release-groups'])
    albums = artistData['artist']['release-group-list']
    return albums

def FindAlbumName(albums, rawAlbumName):
    for album in albums:
        if album['title'] in rawAlbumName:
            return album['title']

def RenameDirectory(oldDirPath, newDirName):
    splitDir = oldDirPath.split('/')
    if splitDir[-1] == newDirName:
        return 'Dir already has that name'
    else:
        splitDir[-1] = newDirName 
        newDirPath = '/'.join(splitDir)
                
        try:
            os.rename(oldDirPath, newDirPath)
            return 'Dir has been renamed'
        except FileNotFoundError:
            return 'Dir not found'

files = GetAllFiles()

# Looking up the artist for every file is lowkey insane and I NEED to change this
# 1 Sec wait at the end of every iteration may be needed to keep under MB lookup limit. ANNOYING

print("===RENAME STARTING===")
for i in range(len(files)):
    artistName, rawAlbumName = GetMBLookupTerms(files[i])
    albums = MBLookup(artistName)
    albumName = FindAlbumName(albums, rawAlbumName)
    pathsAndFiles = os.path.split(files[i])
    print(RenameDirectory(pathsAndFiles[0], albumName))
    #sleep(1)

print("========DONE=========")
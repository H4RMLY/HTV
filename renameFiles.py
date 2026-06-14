import glob, os, sys 
import musicbrainzngs as mb
from time import sleep

def GetAllFiles():
    files = glob.glob(rootDir + '/**/*.flac', recursive=True)
    return files

def GetAllDirectories():
    dirs = glob.glob(rootDir + '/**/', recursive=True)
    return dirs

def GetMBLookupTerms(filePath):
    splitString = filePath.split('/')
    artistName = splitString[-3]
    albumName = splitString[-2]
    return artistName, albumName

def IsValidDir(directory):
    return False if directory.count('/') != 6 else True

def MBLookup(artistName):
    mb.set_useragent("HTV", "1.0", "h4rmly@proton.me")
    result = mb.search_artists(artistName)
    artist = result['artist-list'][0]
    artistData = mb.get_artist_by_id(artist['id'], includes=['release-groups'])
    albums = artistData['artist']['release-group-list']
    return albums

def FindAlbumName(albums, rawAlbumName):
    for album in albums:
        if album['title'] in rawAlbumName: # finding first match, doesnt work for Arist - Album when artist has selftitled
            return album['title']

def RenameDirectory(oldDirPath, newDirName):
    splitDir = oldDirPath.split('/')
    if splitDir[-2] == newDirName:
        return 'Directory already has that name'
    elif newDirName is None:
        return 'Given name is none (MB search may have failed), skipping'
    else:
        print("New Dir Name: " + newDirName)
        splitDir[-2] = newDirName 
        newDirPath = '/'.join(splitDir)
                
        try:
    #        os.rename(oldDirPath, newDirPath)
            print(newDirPath)
            return 'Directory has been renamed'
        except FileNotFoundError:
            return 'Directory not found'

# Looking up the artist for every file is lowkey insane and I NEED to change this
# 1 Sec wait at the end of every iteration may be needed to keep under MB lookup limit. ANNOYING

def RenameAllDirs():
    dirs = GetAllDirectories()
    print("===RENAME STARTING===")
    for i in range(len(dirs)):
        if IsValidDir(dirs[i]) == False:
            print("Skipping directory, too shallow")
            continue
        else:
            artistName, rawAlbumName = GetMBLookupTerms(dirs[i])
            albums = MBLookup(artistName)
            albumName = FindAlbumName(albums, rawAlbumName)
            print(RenameDirectory(dirs[i], albumName))
            sleep(1)
    print("========DONE=========")
        

def RenameAllFiles():
    print(GetAllFiles())

def ShowCommandOptions():
    print("Automatically rename the directories or music files.\n" \
    "Directories will be renamed to the album and files will be renamed to the respecitve song name\n")
    print("Usage: renameFiles.py [options]")
    print(" Options:\n" \
            "         -h, --help                Show help menu\n" \
            "         -d, --directory-rename    Rename all directories in the given root directory\n" \
            "         -f, --file-rename         Rename all files inside the given root directory and sub-directories")
    
if len(sys.argv) < 2:
    print("ERROR: No arguments provided")
    ShowCommandOptions()

elif sys.argv[1] == "-d" or sys.argv[1] == "--directory-rename":
    try: 
        rootDir = sys.argv[2]
        print("Renaming directories from root: [" + rootDir + "]")
        RenameAllDirs()
    except IndexError:
        print("ERROR: No root directory provided")

elif sys.argv[1] == "-f" or sys.argv[1] == "--file-rename":
    try: 
        rootDir = sys.argv[2]
        print("Renaming files from root: [" + rootDir + "]")
        RenameAllFiles()
    except IndexError:
        print("ERROR: No root directory provided")

elif sys.argv[1] == "-h" or sys.argv[1] == "--help":
    ShowCommandOptions()

else:
    print("ERROR: Invalid argument")
    ShowCommandOptions()

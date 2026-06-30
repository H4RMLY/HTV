import glob, os, sys 
import musicbrainzngs as mb
from time import sleep

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

def GetMBLookupTerms(filePath):
    splitString = filePath.split('/')
    artistName = splitString[-2]
    albumName = splitString[-1]
    return artistName, albumName


def GetAlbumSongs(artistName, rawAlbumName):
    """
    Fetches all songs from a specific album using existing MBLookup logic.
    
    Args:
        artistName (str): The name of the artist
        rawAlbumName (str): The raw album name to match
        
    Returns:
        list: Array of song titles from the album
    """
    try:
        albums = MBLookup(artistName)
        
        # Search for the specific release
        album_result = mb.search_releases(rawAlbumName, artist=artistName)
        release_id = album_result['release-list'][0]['id']
        release_data = mb.get_release_by_id(release_id, includes=['recordings'])
        songs = []
        for track in release_data['release']['medium-list'][0]['track-list']: # crazy
            songs.append(track['recording']['title'])
        
        return songs
        
    except (IndexError, KeyError) as e:
        print(e)
        return []

def main():
    filePath = "/mnt/TheMegaGasDrive/Music/Paramore/Paramore"
    artistName, albumName = GetMBLookupTerms(filePath)
    print(artistName, albumName)
    songs = GetAlbumSongs(artistName, albumName)
    print(songs)

main()

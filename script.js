console.log("Let's start JavaScript now. Don't be demotivated, please, even if it gives you a tough time.");

// Avoid multiple songs to play, declare a global variable 
let currentSong = new Audio();
let songs; // Declare songs globally for access in functions
let currentSongIndex = 0; // Track the index of the currently playing song
let currentFolder;

// Function to convert seconds to MM:SS format
function convertSecondsToMinutesAndSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60); // Use Math.floor to ensure seconds are integers
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Updated the getSongs function to getSong and adjusted the URL fetching logic
async function getSong(folder) {
  currentFolder = folder;
  // Simulate fetching songs from server
  let a = await fetch(`http://127.0.0.1:3000/${currentFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songsList = [];
  // Parse song URLs to get song names
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songsList.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  return songsList;
}

// Function to play music
const playMusic = (track, trackName, resume = false) => {
  // Preserve current time when resuming
  const currentTime = currentSong.currentTime;
  currentSong.src = `${currentFolder}/${track}`;
  if (resume) {
    currentSong.currentTime = currentTime; // Set current time to preserved value
  }
  currentSong.play();
  document.querySelector("#play").src = "pause.svg"; // Change play button to pause button

  // Update song info and time
  document.querySelector(".songinfo").innerHTML = decodeURI(trackName);
  document.querySelector(".songtime").innerHTML = "00:00/00:00"; // Update this to actual time if needed
}

// Function to handle next song
const playNext = () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length; // Wrap around to the beginning if at the end
  const nextTrack = songs[currentSongIndex];
  playMusic(nextTrack, nextTrack.replaceAll("%20", " "));
}

// Function to handle previous song
const playPrevious = () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Wrap around to the end if at the beginning
  const prevTrack = songs[currentSongIndex];
  playMusic(prevTrack, prevTrack.replaceAll("%20", " "));
}

// Function to initialize the song list in the library
function initializeSongsList(songsList) { // Added this function
  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = ""; // Clear the current song list
  for (const song of songsList) {
    songUL.innerHTML += `<li> 
        <img src="music.svg" alt="music" class="invert">
        <div class="info">
          <h3>${song.replaceAll("%20", " ")}</h3>
          <p>Sohaib Hassan</p>
        </div>
        <div class="play">
          <span>Play Now</span>
          <img src="play.svg" alt="play" class="invert">
        </div> 
      </li>`;
  }

  // Add event listeners to each song list item
  Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      const trackName = e.querySelector('.info h3').innerHTML.trim();
      console.log(trackName);
      currentSongIndex = index; // Update currentSongIndex to the clicked song
      playMusic(songs[currentSongIndex], trackName);
    });
  });
}

// Main function
async function main() {
  // Get the list of all the songs
  songs = await getSong("songs/ncs");
  console.log(songs);

  // Initialize the song list in the library
  initializeSongsList(songs); // Added this line

  // Add event listener to the play/pause button
  document.querySelector("#play").addEventListener("click", () => {
    if (currentSong.paused) {
      playMusic(songs[currentSongIndex], songs[currentSongIndex].replaceAll("%20", " "), true); // Resume playback
    } else {
      currentSong.pause();
      document.querySelector("#play").src = "play.svg"; // Change to play button when paused
    }
  });

  // Add event listener to the next button
  document.querySelector("#next").addEventListener("click", () => {
    playNext();
  });

  // Add event listener to the previous button
  document.querySelector("#previous").addEventListener("click", () => {
    playPrevious();
  });

  // Initialize song info and song time
  document.querySelector(".songtime").innerHTML = "00:00/00:00";

  // Listen for time update event 
  currentSong.addEventListener("timeupdate", () => {
    // Get the duration and current time of the song
    const duration = currentSong.duration;
    const currentTime = currentSong.currentTime;

    // Update song time display
    document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentTime)}/
      ${convertSecondsToMinutesAndSeconds(duration)}`;
      // Circle move 
      document.querySelector(".circle").style.left = (currentTime / duration) * 100 + "%";
  });

  // Add event listener to seek bar when clicked on it
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    // Change the duration and time
    currentSong.currentTime = (currentSong.duration) * percent / 100;
  });

  // Hamburger 
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-100%";
  });

  // Add an event to volume
  document.querySelector(".volume input[type='range']").addEventListener("change", (e) => {
    console.log(e, e.target, e.target.value);
    currentSong.volume = parseInt(e.target.value) /100;
    const value = parseInt(e.target.value);
    document.querySelector("#volume-value").innerHTML = value;
  });

  // Load the folder 
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log(item, item.currentTarget.dataset.folder);
      songs = await getSong(`songs/${item.currentTarget.dataset.folder}`);
      initializeSongsList(songs); // Added this line to update the playlist library with the new songs
      playMusic(songs[0], songs[0].replaceAll("%20", " ")); // Start playing the first song in the folder
    });
  });

// mute volume
   document.querySelector(".volume>img").addEventListener("click",(e)=>{
      // volume range
        const volumeRange =document.querySelector(".volume input[type='range']");
          console.log(e)
          if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            volumeRange.value = 0;
             currentSong.volume =0
             document.querySelector("#volume-value").innerHTML = 0
          }else{
            currentSong.volume=0.10
            e.target.src =e.target.src.replace("mute.svg","volume.svg")
            volumeRange.value=50
            document.querySelector("#volume-value").innerHTML = 50

          }
   })

  //  port
  // Inside your script.js file

fetch('http://127.0.0.1:3000/songs/ncs/', {
  mode: 'no-cors'
})
.then(response => {
  // You won't be able to access the response data here due to 'no-cors' mode
  console.log('Request successful (but response data inaccessible)');
})
.catch(error => {
  console.error(error);
});
}

main(); // Start the main function when the script loads

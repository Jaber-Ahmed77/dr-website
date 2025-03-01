import { useEffect } from "react";

const VideoPlayer = ({ video }) => {
  useEffect(() => {
    // Prevent right-click
    const disableRightClick = (event) => event.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  useEffect(() => {
    if (!video?.snippet?.resourceId?.videoId) return;

    // Load YouTube Iframe API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new YT.Player("youtube-player", {
        videoId: video.snippet.resourceId.videoId,
        playerVars: {
          modestbranding: 1, // No YouTube logo
          controls: 0, // Hide play/pause controls
          rel: 0, // No related videos
          fs: 0, // No fullscreen button
          disablekb: 1, // Disable keyboard shortcuts
        },
        events: {
          onReady: (event) => event.target.playVideo(),
        },
      });
    };
  }, [video]);

  return (
    Object.keys(video).length ? (
      <>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font font-semibold">{video?.snippet?.title}</h2>
          <p className="text-gray-600 break-words">
            {video?.snippet?.description || "No Description"}
          </p>
        </div>
        <div className="relative w-full aspect-video mt-7 p-3 shadow-lg rounded-md bg-white">
          <div className="w-full h-full rounded-md" id="youtube-player"></div>
        </div>
      </>
    ) : null
  );
};

export default VideoPlayer;
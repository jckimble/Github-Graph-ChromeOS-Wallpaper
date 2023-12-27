import { gql } from "graphql-request";
import "./themes";
import { getTheme } from "./theme";

const query = gql`
  {
    viewer {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

export const getContributions = (token: string): Promise<any> =>
  new Promise((resolve, reject) => {
    fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': "Bearer " + token
  },
  body: JSON.stringify({
    query: query,
  }),
})
.then((data)=>data.json())
      .then((resp: any) => {
        resolve(resp.data.viewer.contributionsCollection.contributionCalendar)
      })
      .catch(reject);
  });

  export const buildCanvas = (
    contributions: any,
    width: number,
    height: number,
    margin: number,
    themeName: string,
    isDark: boolean
  ) => {
    const weeks = contributions.weeks;
    const border = width % weeks.length;
    const cube = (width - border) / weeks.length - margin * 2;
    const centerStart = height / 2 - ((cube + margin * 2) * 7) / 2;
  
    const theme = getTheme(themeName,isDark);
    const canvas = new OffscreenCanvas(width,height)
    const context = canvas.getContext("2d");
    if(!context){
      console.log("Unable to create canvas")
      return
    }
    context.fillStyle = theme.getColor("background");
    context.fillRect(0, 0, width, height);
  
    let left = border / 2 + margin;
    for (let w = 0; w < weeks.length; w++) {
      let top = centerStart;
      let days = weeks[w].contributionDays;
      for (let d = 0; d < days.length; d++) {
        context.fillStyle = theme.getColor(days[d].contributionLevel);
        context.fillRect(left, top, cube, cube);
        top += cube + margin * 2;
      }
      left += cube + margin * 2;
    }
  
    return canvas;
  };
  
const getPrimary = async ()=>{
  const displays = await chrome.system.display.getInfo()
  return displays.find((val)=>val.isEnabled && val.isPrimary)
}
const updateWallpaper = async ()=>{
  const options= await chrome.storage.sync.get({
    theme: "green",
    isDark: false,
    token: ""
  })
  if(!options.token){
    console.log("No Token")
    return
  }
  const display= (await getPrimary())?.bounds
  console.log(display)
  const cal = await getContributions(options.token);
  const canvas = buildCanvas(
        cal,
        display?.width || 768,
        display?.height || 1024,
        2,
        options.theme,
        options.isDark
      );
  const blob=await canvas?.convertToBlob()
  const buffer = await blob?.arrayBuffer()
  console.log("Setting Wallpaper")
  chrome.wallpaper.setWallpaper({
    layout: "STRETCH",
    filename: "github_contributions",
    data: buffer
  },()=>{})
  await chrome.alarms.clear('timeUpdate')
  chrome.alarms.create('timeUpdate', { delayInMinutes: 30, periodInMinutes: 30 })
}
chrome.runtime.onStartup.addListener(updateWallpaper)
chrome.system.display.onDisplayChanged.addListener(updateWallpaper)
chrome.alarms.onAlarm.addListener(updateWallpaper)
import styles from "./WeatherBox.module.scss";

type ForecastIcon = "cloud" | "sun" | "sun-cloud" | "rain-cloud";

const WEEK_FORECAST: {
  day: string;
  icon: ForecastIcon;
  temp: string;
  trendY: number;
}[] = [
  { day: "MON", icon: "cloud", temp: "20°C", trendY: 40 },
  { day: "TUE", icon: "sun", temp: "21°C", trendY: 25 },
  { day: "WED", icon: "sun-cloud", temp: "21°C", trendY: 25 },
  { day: "THU", icon: "sun", temp: "20°C", trendY: 40 },
  { day: "FRI", icon: "sun", temp: "19°C", trendY: 45 },
  { day: "SAT", icon: "cloud", temp: "17.5°C", trendY: 55 },
  { day: "SUN", icon: "rain-cloud", temp: "19°C", trendY: 45 },
];

// 四種圖示共用同一個以 (0,0) 為中心的正方形 viewBox，雲/雨的座標都平移過，
// 讓每種圖示的視覺重心都落在 (0,0) 附近——這樣不管哪個組合，SVG 都能靠
// CSS 置中對齊，不用再為每種圖示各調一次 viewBox 位移。
const ICON_VIEW_BOX = "-50 -50 100 100";

const CLOUD_SHAPE = [
  { cx: 15, cy: 7.5, r: 20 },
  { cx: 0, cy: 7.5, r: 20 },
  { cx: -15, cy: 7.5, r: 20 },
  { cx: -10, cy: -12.5, r: 15 },
  { cx: 8, cy: -7.5, r: 15 },
];

function ForecastIconSvg({ icon }: { icon: ForecastIcon }) {
  const showSun = icon === "sun" || icon === "sun-cloud";
  const showCloud =
    icon === "cloud" || icon === "sun-cloud" || icon === "rain-cloud";
  const showRain = icon === "rain-cloud";
  // 太陽+雲那個組合圖示的雲要偏左下角，才不會整個蓋住太陽——單獨的雲/
  // 雨雲則維持置中的座標。
  const [cloudDx, cloudDy] = icon === "sun-cloud" ? [-15, 15] : [0, 0];

  return (
    <svg className={styles.forecastIcon} viewBox={ICON_VIEW_BOX}>
      {showSun && <circle className={styles.sun} cx="0" cy="0" r="22" />}
      {showRain && (
        <>
          <line className={styles.rain} x1="-10" y1="-7.5" x2="-10" y2="12.5" />
          <line className={styles.rain} x1="1" y1="-17.5" x2="1" y2="2.5" />
          <line className={styles.rain} x1="10" y1="-2.5" x2="10" y2="22.5" />
        </>
      )}
      {showCloud &&
        CLOUD_SHAPE.map((circle, i) => (
          <circle
            key={i}
            className={styles.cloud}
            cx={circle.cx + cloudDx}
            cy={circle.cy + cloudDy}
            r={circle.r}
          />
        ))}
    </svg>
  );
}

function TreeSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100">
      <rect x="40" y="60" width="10" height="40" />
      <polygon points="25,85 45,20 46,80" />
      <polygon points="65,85 45,20 45,80" />
      <polygon points="20,75 45,20 45,70" />
      <polygon points="70,75 45,20 45,70" />
      <polygon points="25,55 45,20 45,55" />
      <polygon points="65,55 45,20 45,55" />
    </svg>
  );
}

// 移植自 CodePen 動態互動天氣盒子練習：day/night 純 CSS 切換（checkbox+label，不需要
// JS），鹿/鳥/河流的插畫直接用 svgsilh.com 的 SVG 連結包 <img> 顯示。
export default function WeatherBox() {
  return (
    <div className={styles.daybox}>
      <label>
        <input className={styles.switchNight} type="checkbox" />
        <div className={styles.top}>
          <svg className={styles.mountain} viewBox="-100 -100 500 500">
            <polygon points="300,150 490,450 340,230 320,260 290,200 230,250" />
            <polygon points="130,80 280,370 150,145 110,190 100,160 35,250" />
            <polygon points="-30,150 160,450 10,230 -10,260 -40,200 -100,250" />
          </svg>
          <img
            className={styles.imgDeer}
            src="https://svgsilh.com/svg/3364874.svg"
            alt=""
          />
          <img
            className={styles.imgBird}
            src="https://svgsilh.com/svg/2022610.svg"
            alt=""
          />
          <img
            className={styles.imgRiver}
            src="https://svgsilh.com/svg/1106336.svg"
            alt=""
          />
          <TreeSvg className={`${styles.tree1} ${styles.treeFirst}`} />
          <img
            className={styles.imgWolf}
            src="https://svgsilh.com/svg/1254382.svg"
            alt=""
          />
          <TreeSvg className={`${styles.tree1} ${styles.treeSecond}`} />
          <div className={styles.moon} />
          <div className={styles.textArea}>
            <div className={styles.temperature}>26°C</div>
            <div className={styles.infos}>
              <div className={styles.time}>2026/7/26 Monday 7:47AM</div>
            </div>
          </div>
          <div className={styles.textArea2}>
            <div className={styles.temperature}>20°C</div>
            <div className={styles.infos}>
              <div className={styles.time}>2026/7/26 Monday 7:47PM</div>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          {WEEK_FORECAST.map((day) => (
            <div className={styles.dayweather} key={day.day}>
              <h3>{day.day}</h3>
              <ForecastIconSvg icon={day.icon} />
            </div>
          ))}
          <svg className={styles.temsvg}>
            <polyline
              points={WEEK_FORECAST.map(
                (day, i) => `${20 + i * 60},${day.trendY}`,
              ).join(" ")}
            />
            {WEEK_FORECAST.map((day, i) => (
              <g key={day.day}>
                <circle cx={20 + i * 60} cy={day.trendY} r="3" />
                <text x={20 + i * 60} y={day.trendY - 8}>
                  {day.temp}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </label>
    </div>
  );
}

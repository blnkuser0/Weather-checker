import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = "1dc3509af96cbbbca3501579a48e6914";
console.log("Loaded API Key:", API_KEY);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/weather", async (req, res) => {
    const { city, startTime, endTime } = req.body;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;


    try {
      const response = await axios.get(forecastUrl);
      const forecastList = response.data.list;

      const now = new Date();
      const tomorrowStr = new Date(now.setDate(now.getDate() + 1))
        .toISOString()
        .split("T")[0];

        const [startHour] = startTime.split(":").map(Number);
        const [endHour] = endTime.split(":").map(Number);


      const filteredForecasts = forecastList.filter((entry) => {
        const entryDate = new Date(entry.dt_txt);
        const entryHour = entryDate.getHours();
        return (
          entry.dt_txt.startsWith(tomorrowStr) &&
          entryHour >= startHour &&
          entryHour <= endHour
        );
      });

        const summaries = filteredForecasts.map((entry) => {
        const entryDate = new Date(entry.dt_txt);
        const time = entryDate.toLocaleTimeString("en-PH", {
          hour: "numeric",
          hour12: true,
        });

        const desc = entry.weather[0].description;
        const tempC = entry.main.temp.toFixed(1);
        const tempF = ((entry.main.temp * 9) / 5 + 32).toFixed(1);

        let suggestion = "";
        if (desc.includes("rain")) suggestion = "🌧️ Bring umbrella.";
        else if (desc.includes("clear") && entry.main.temp > 30)
          suggestion = "☀️ Wear sunscreen due to high UV rays.";
        else suggestion = "✅ No umbrella or sunscreen needed.";

        return {
          time,
          desc,
          tempC,
          tempF,
          suggestion,
        };
      });

      res.render("result", {
        city,
        summaries,
        startTime,
        endTime,
      });
    } catch (err) {
      console.error(err.message);
      res.send("Error retrieving weather data.");
    }
})

// app.get("/test", async (req, res) => {
//   try {
//     const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=Manila&units=metric&appid=${API_KEY}`;
//     const response = await axios.get(testUrl);
//     res.send(response.data);
//   } catch (err) {
//     console.error(err.message);
//     res.send("Test failed");
//   }
// });
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_KEY = "1dc3509af96cbbbca3501579a48e6914";
console.log("Loaded API Key:", API_KEY);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/weather", async (req, res) => {
    const city = req.body.city;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;


    try {
        const forecastResponse = await axios.get(forecastUrl);
        const forecastList = forecastResponse.data.list;

        // Find the forecast for around 12:00 noon tomorrow
        const now = new Date();
        const tomorrowDateStr = new Date(now.setDate(now.getDate() + 1))
          .toISOString()
          .split("T")[0];

        const tomorrowForecast = forecastList.find(
          (entry) =>
            entry.dt_txt.startsWith(tomorrowDateStr) &&
            entry.dt_txt.includes("12:00:00")
        );
    
        if (!tomorrowForecast) {
          return res.send("Couldn't find forecast data for tomorrow.");
        }

        const weatherDesc = tomorrowForecast.weather[0].description;
        const rainType = weatherDesc.includes("heavy")
          ? "Heavy Rain"
          : weatherDesc.includes("moderate")
          ? "Mild Rain"
          : weatherDesc.includes("light")
          ? "Light Rain"
          : "No Rain";

        // UV index is not available in /forecast endpoint, so use a placeholder or remove
        const sunscreenAlert = weatherDesc.includes("clear")
          ? "Yes, apply sunscreen!"
          : "No sunscreen needed.";
    
        res.render("result", {
          city,
          rainType,
          weatherDesc,
          uvIndex: "N/A",
          sunscreenAlert,
        });
      } catch (error) {
        console.error(error.message);
        res.send("Error retrieving weather data. Please try again.");
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
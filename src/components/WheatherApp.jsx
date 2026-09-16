import { useState } from 'react'
import { getWeatherInfo } from '../utils/weatherCode'
import { getCoordinates, getCurrentWeather } from '../services/weatherService'
import { formatDate } from '../utils/formatDate'
import SearchBar from './SearchBar'
import WeatherCard from './WeatherCard'
import WeatherDetails from './WeatherDetails'
import sunny from '../assets/images/sunny.png'
import cloudy from '../assets/images/cloudy.png'
import rainy from '../assets/images/rainy.png'
import snowy from '../assets/images/snowy.png'
import loadingGif from '../assets/images/loading.gif'

const WheatherApp = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [location, setLocation] = useState('')
    const [data, setData] = useState(null)

    const handleInputChanges = (e) => {
        setLocation(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            search(location)
        }
    }

    const search = async (city) => {
        const normalizedCity = city.trim()

        if (!normalizedCity) {
            setError('Enter a city name')
            return
        }

        try {
            setLoading(true)
            setError('')

            const coordinates = await getCoordinates(normalizedCity)

            if (!coordinates) {
                setError('City not found')
                setData(null)
                return
            }

            const currentWeather = await getCurrentWeather(
                coordinates.latitude,
                coordinates.longitude
            )

            setData({
                city: coordinates.name,
                country: coordinates.country,
                temperature: currentWeather.temperature_2m,
                humidity: currentWeather.relative_humidity_2m,
                windSpeed: currentWeather.wind_speed_10m,
                weatherCode: currentWeather.weather_code,
                time: currentWeather.time
            })

            setLocation('')
        } catch (err) {
            console.error(err)
            setError('Unable to load weather data')
            setData(null)
        } finally {
            setLoading(false)
        }
    }



    const weatherImages = {
        sunny,
        cloudy,
        rainy,
        snowy
    }


    const weatherInfo = data
        ? getWeatherInfo(data.weatherCode)
        : null

    const weatherImage = weatherInfo
        ? weatherImages[weatherInfo.type]
        : sunny

    return (
        <div className="container">
            <div className="weather-app">
                <SearchBar
                    city={data ? data.city : ''}
                    location={location}
                    onChange={handleInputChanges}
                    onKeyDown={handleKeyDown}
                    onSearch={() => search(location)}
                />

                {error && (
                    <div className="not-found">
                        {error}
                    </div>
                )}

                {loading ? (
                    <img
                        className="loader"
                        src={loadingGif}
                        alt="Loading"
                    />
                ) : (
                    <>
                        <WeatherCard
                            image={weatherImage}
                            description={weatherInfo ? weatherInfo.description : '--'}
                            temperature={data ? data.temperature : 0}
                        />

                        <div className="weather-date">
                            <p>{data ? formatDate(data.time) : ''}</p>
                        </div>

                        <WeatherDetails
                            humidity={data ? `${data.humidity}%` : '--'}
                            windSpeed={data ? data.windSpeed : '--'}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default WheatherApp
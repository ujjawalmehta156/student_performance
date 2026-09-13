import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    study_hours_per_day: 5,
    attendance_percentage: 85,
    previous_exam_score: 75,
    daily_screen_time: 3,
    sleep_hours: 7,
    gender: 'Male',
    education_level: 'High School'
  })
  
  const [prediction, setPrediction] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch metrics on load
    axios.get('http://localhost:8000/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error("Failed to fetch metrics", err))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)
    
    try {
      const res = await axios.post('http://localhost:8000/predict', formData)
      setPrediction(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="glass-panel">
        <header className="header">
          <h1>Student Performance Predictor</h1>
          {metrics && metrics.accuracy !== "N/A" && (
            <div className="accuracy-badge">
              Model Accuracy: {(metrics.accuracy * 100).toFixed(1)}%
            </div>
          )}
        </header>

        <div className="main-content">
          <form className="prediction-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Study Hours / Day ({formData.study_hours_per_day})</label>
                <input type="range" name="study_hours_per_day" min="0" max="15" step="0.5" value={formData.study_hours_per_day} onChange={handleChange} />
              </div>
              
              <div className="input-group">
                <label>Attendance % ({formData.attendance_percentage}%)</label>
                <input type="range" name="attendance_percentage" min="0" max="100" value={formData.attendance_percentage} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Previous Exam Score ({formData.previous_exam_score})</label>
                <input type="range" name="previous_exam_score" min="0" max="100" value={formData.previous_exam_score} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Daily Screen Time ({formData.daily_screen_time}h)</label>
                <input type="range" name="daily_screen_time" min="0" max="15" step="0.5" value={formData.daily_screen_time} onChange={handleChange} />
              </div>
              
              <div className="input-group">
                <label>Sleep Hours ({formData.sleep_hours}h)</label>
                <input type="range" name="sleep_hours" min="0" max="12" step="0.5" value={formData.sleep_hours} onChange={handleChange} />
              </div>
              
              <div className="input-group select-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="input-group select-group">
                <label>Education Level</label>
                <select name="education_level" value={formData.education_level} onChange={handleChange}>
                  <option>High School</option>
                  <option>Undergraduate</option>
                  <option>Postgraduate</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Analyzing..." : "Predict Performance"}
            </button>
          </form>

          <div className={`results-panel ${prediction ? 'visible' : ''}`}>
            {error && <div className="error-message">{error}</div>}
            
            {prediction && (
              <div className={`prediction-card ${prediction.pass_status.toLowerCase()}`}>
                <h2>{prediction.pass_status}</h2>
                <div className="confidence-meter">
                  <div 
                    className="confidence-fill" 
                    style={{width: `${prediction.confidence * 100}%`}}
                  ></div>
                </div>
                <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

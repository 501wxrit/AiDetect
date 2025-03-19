import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // นำเข้า react-toastify
import 'react-toastify/dist/ReactToastify.css'; // นำเข้า CSS ของ react-toastify
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [result, setResult] = useState(null); // เก็บทั้ง message และ image_url

  const years = Array.from({ length: 2568 - 2500 + 1 }, (_, i) => 2500 + i);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !name) {
      toast.warning('กรุณากรอกข้อมูลให้ครบ', {
        position: "top-right",
        autoClose:3000, // หายไปหลัง 5 วินาที
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        closeButton: false, // ลบปุ่ม Close
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('birthYear', birthYear);

    try {
      const response = await axios.post('http://172.21.20.191:1880/api/sol', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response data:', response.data); // ตรวจสอบโครงสร้าง response

      // สร้างข้อความจาก detected_objects
      const detectedObjects = response.data.detected_objects || [];
      const objectsText = detectedObjects.length > 0
        ? detectedObjects.map(obj => `${obj.class} (${obj.confidence}%)`).join('\n')
        : "🔍 ไม่พบวัตถุที่ตรวจจับได้";

      const nameAndAgeText = `ผู้ส่ง👤\n   ชื่อ: ${name}\n   ปีเกิด: พ.ศ. ${birthYear}`;
      const message = `📸วัตถุที่ถูกตรวจจับได้โดย AI 🔥\n\n${objectsText}\n\n${nameAndAgeText}`;

      // เพิ่ม timestamp ใน image_url
      const timestamp = new Date().getTime(); // ดึง timestamp เป็น milliseconds
      const imageUrlWithTimestamp = `${response.data.image_url || 'http://172.21.20.191/image'}?timestamp=${timestamp}`;

      setResult({
        message: message,
        image_url: imageUrlWithTimestamp
      });
      toast.success('ส่งข้อมูลสำเร็จ!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: false, // ลบปุ่ม Close
      });
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: false, // ลบปุ่ม Close
      });
    }
  };

  // ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบ พ.ศ. และเพิ่ม timestamp
  const getTimestamp = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // เดือนเริ่มจาก 0
    const year = now.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${day} ${getThaiMonth(month)} ${year} ${hours}:${minutes}:${seconds}`;
  };

  // ฟังก์ชันแปลงเลขเดือนเป็นชื่อเดือนไทย
  const getThaiMonth = (month) => {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return thaiMonths[month - 1];
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <h1>Welcome {name || 'Guest'}</h1> {/* แสดง 'Guest' ถ้า name ว่าง */}
        <h2 style={{ marginTop: '-18px' }}>To Node-red Mini Project</h2>

        <div className="form-group">
          <label>ชื่อ: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="กรอกชื่อของคุณ"
          />
        </div>
        <div className="form-group">
          <label>ปีเกิด (พ.ศ.): </label>
          <select
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          >
            <option value="">-- เลือกปีเกิด --</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>เลือกไฟล์รูปภาพ: </label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">ส่งข้อมูล</button>
      </form>

      {/* ส่วนแสดงผลลัพธ์ */}
      {result && (
        <div className="result">
          <h2>ผลลัพธ์:</h2>
          <pre>{result.message}</pre>
          {/* แสดงรูปภาพจาก URL */}
          {result.image_url && (
            <div className="result-image">
              <img
                src={result.image_url}
                alt="Processed Image"
                style={{ maxWidth: '100%', borderRadius: '5px', marginTop: '10px' }}
              />
              <p className="timestamp">Timestamp: {getTimestamp()}</p>
            </div>
          )}
        </div>
      )}
      <ToastContainer /> {/* เพิ่ม ToastContainer เพื่อแสดงการแจ้งเตือน */}
    </div>
  );
}

export default App;
# SBPMNS - Smart Border Passenger Management System

A modern, full-stack web application for managing border passenger operations, vehicle tracking, trip scheduling, and health monitoring.

![SBPMNS Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### Core Functionality
- **Passenger Registration** - Register passengers with biometric data, health status, and blacklist management
- **Border Control** - Real-time border entry/exit tracking with alert system
- **Vehicle Management** - Track and manage fleet vehicles
- **Trip Management** - Schedule and monitor trips with vehicle assignments
- **Ticket Booking** - Book tickets for passengers on scheduled trips
- **User Management** - Role-based access control with multiple user types
- **Dashboard** - Real-time statistics and activity monitoring
- **Audit Logs** - Complete system activity tracking

### User Roles
- **Super Admin** - Full system access including user management
- **Company Admin** - Manage operations, vehicles, trips, and passengers
- **Border Officer** - Handle border control and passenger verification
- **Health Officer** - Monitor passenger health status

### Modern UI/UX
- Dark theme with blue accents
- Responsive design (mobile, tablet, desktop)
- Animated login/register pages
- Sidebar navigation with active state highlighting
- Real-time data updates
- Smooth transitions and animations

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sbpmns
```

### 2. Backend Setup

```bash
cd sbpmns-backend
npm install
```

Create a `.env` file in the `sbpmns-backend` directory:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sbpmns_db
JWT_SECRET=your_jwt_secret_key_here
PORT=5001
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `src/config.js` file:
```javascript
const API_BASE_URL = 'http://localhost:5001/api/sbpmns';
export default API_BASE_URL;
```

### 4. Database Setup

The application will automatically:
- Create the database if it doesn't exist
- Create all required tables
- Seed default users on first run

## 🎯 Running the Application

### Start Backend Server
```bash
cd sbpmns-backend
npm start
```
Backend will run on `http://localhost:5001`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 👤 Default Users

On first run, the following users are created:

| Username | Password | Role |
|----------|----------|------|
| superadmin | admin123 | Super Admin |
| companyadmin | company123 | Company Admin |
| borderofficer | border123 | Border Officer |
| healthofficer | health123 | Health Officer |

**⚠️ Important:** Change these passwords immediately after first login!

## 📱 Application Structure

```
sbpmns/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BorderControl.jsx
│   │   │   ├── VehicleManagement.jsx
│   │   │   ├── TripManagement.jsx
│   │   │   ├── TicketBooking.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── App.css
│   │   ├── config.js
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── sbpmns-backend/
    ├── config/
    │   ├── db.js
    │   └── constants.js
    ├── controllers/
    │   ├── authController.js
    │   ├── passengerController.js
    │   ├── vehicleController.js
    │   ├── tripController.js
    │   ├── ticketController.js
    │   └── borderEntryController.js
    ├── middleware/
    │   └── auth.js
    ├── routes/
    ├── utils/
    │   └── createTables.js
    ├── server.js
    └── package.json
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- SQL injection prevention
- XSS protection

## 📊 Database Schema

### Tables
- **users** - System users with roles
- **passengers** - Passenger information and biometrics
- **vehicles** - Fleet management
- **trips** - Trip scheduling
- **tickets** - Ticket bookings
- **border_entries** - Border crossing records
- **audit_logs** - System activity logs

## 🎨 Features by Role

### Super Admin
- Full system access
- User management (create, edit, delete users)
- View audit logs
- All company admin features

### Company Admin
- Passenger registration
- Vehicle management
- Trip scheduling
- Ticket booking
- Operations overview

### Border Officer
- Border entry/exit processing
- Passenger verification
- Alert monitoring
- Border activity logs

### Health Officer
- Health status monitoring
- Quarantine management
- Health alerts
- Passenger health records

## 🌐 API Endpoints

### Authentication
- `POST /api/sbpmns/login` - User login
- `POST /api/sbpmns/register` - User registration

### Passengers
- `GET /api/sbpmns/passengers` - Get all passengers
- `POST /api/sbpmns/passengers` - Register new passenger
- `GET /api/sbpmns/passengers/:id` - Get passenger details

### Vehicles
- `GET /api/sbpmns/vehicles` - Get all vehicles
- `POST /api/sbpmns/vehicles` - Add new vehicle

### Trips
- `GET /api/sbpmns/trips` - Get all trips
- `POST /api/sbpmns/trips` - Create new trip

### Tickets
- `GET /api/sbpmns/tickets` - Get all tickets
- `POST /api/sbpmns/tickets` - Book ticket

### Border Control
- `GET /api/sbpmns/border-entries` - Get border entries
- `POST /api/sbpmns/border-entries` - Record entry
- `PUT /api/sbpmns/border-entries/:id/exit` - Record exit

### Dashboard
- `GET /api/sbpmns/dashboard` - Get dashboard data

### User Management (Super Admin only)
- `GET /api/sbpmns/users` - Get all users
- `POST /api/sbpmns/users` - Create user
- `PUT /api/sbpmns/users/:id/role` - Update user role
- `PUT /api/sbpmns/users/:id/active` - Toggle user status
- `DELETE /api/sbpmns/users/:id` - Delete user

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (≤768px)
- 📱 Tablets (769px - 1024px)
- 💻 Desktops (>1024px)

### Mobile Features
- Bottom navigation bar
- Horizontal scrolling tables
- Touch-friendly buttons
- Optimized layouts

## 🎯 Usage Guide

### 1. Login
- Navigate to the login page
- Enter your credentials
- You'll be redirected to the dashboard

### 2. Dashboard
- View real-time statistics
- Monitor active alerts
- Check recent border activity

### 3. Passenger Registration
- Navigate to Registration from sidebar
- Fill in passenger details
- Scan biometric data (simulated)
- Set health status
- Submit registration

### 4. Border Control
- Select passenger from dropdown
- Add entry notes
- System checks for alerts (blacklist, health issues)
- Record entry/exit

### 5. Vehicle & Trip Management
- Add vehicles with capacity
- Schedule trips with departure/destination
- Assign vehicles to trips

### 6. Ticket Booking
- Select passenger
- Choose trip
- Assign seat number
- Book ticket

### 7. User Management (Super Admin)
- Create new users
- Assign roles
- Activate/deactivate users
- View audit logs

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;
```

### Port Already in Use
```bash
# Change port in .env file
PORT=5002
```

### Frontend Can't Connect to Backend
- Verify backend is running on correct port
- Check `config.js` has correct API URL
- Ensure CORS is enabled in backend

## 🔄 Development

### Backend Development
```bash
cd sbpmns-backend
npm run dev  # If nodemon is configured
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email gihozondahayogermain@gmail.com or open an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- MySQL database
- All contributors

---

**Built with ❤️ for efficient border management**

# 🔥 Dark Social Blog Platform

A full-stack social blogging platform with a dark, modern UI featuring real-time notifications, user interactions, and comprehensive admin controls.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green)
![Angular](https://img.shields.io/badge/Angular-18-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## 🌟 Features

### 👤 User Features
- **Authentication & Authorization**
  - JWT-based secure authentication
  - Role-based access control (USER/ADMIN)
  - Token expiration handling with automatic logout
  - Session persistence across browser refreshes

- **Social Interactions**
  - Create, edit, and delete posts with rich text content
  - Like/unlike posts
  - Comment on posts with nested replies
  - Follow/unfollow other users
  - View personalized feed from followed users

- **User Profiles**
  - Customizable profile with avatar upload
  - View user statistics (posts, followers, following)
  - Browse user's post history
  - Real-time follower/following counts

- **Real-Time Notifications**
  - Instant notifications for:
    - New followers
    - Post likes
    - Comments on your posts
    - Replies to your comments
  - Unread badge indicator
  - Mark as read functionality
  - Beautiful dropdown notification center

- **User Discovery**
  - Search users by username
  - Browse user profiles
  - Follow suggestions

### 🛡️ Admin Features
- **User Management**
  - View all registered users
  - Ban/unban users
  - Monitor user activity
  - View user statistics

- **Content Moderation**
  - View all posts across the platform
  - Delete inappropriate content
  - Monitor post engagement

- **Report Management**
  - Review user-reported content
  - Approve or reject reports
  - Take moderation actions

### 🎨 UI/UX Features
- **Modern Dark Theme**
  - Sleek black background with accent colors
  - Smooth animations and transitions
  - Responsive design for all devices
  - Material Design components

- **Creepy Login Animation**
  - Interactive scary face with eye tracking
  - Smooth smile animation on input focus
  - Glowing red accents

- **Error Handling**
  - Custom 404 Not Found page
  - Comprehensive error component for 403, 404, 500 errors
  - User-friendly error messages with navigation options
  - Header hidden on error pages

## 🛠️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.5.7
- **Language:** Java 17
- **Database:** PostgreSQL 16
- **Security:** Spring Security + JWT
- **ORM:** Spring Data JPA / Hibernate
- **Build Tool:** Maven

### Frontend
- **Framework:** Angular 18
- **UI Library:** Angular Material
- **Styling:** CSS3 with custom animations
- **HTTP Client:** Angular HttpClient
- **Routing:** Angular Router
- **State Management:** RxJS

## 📋 Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- PostgreSQL 16+
- Maven 3.8+

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd 01blog
```

### 2. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE blog01;
```

Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/blog01
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

```bash
cd backend

# Build the project
./mvnw clean package -DskipTests

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
ng serve
```

The frontend will start on `http://localhost:4200`

### 5. Default Admin Account

After the first run, you can create an admin account by:
1. Register a normal user
2. Manually update the database to set role to 'ADMIN'
```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```

## ⚙️ Configuration

### JWT Token Settings

In `application.properties`:
```properties
# JWT secret key (change in production!)
app.jwtSecret=mySecretKeyForJWT01BlogApplicationVerySecureKey2024

# Token expiration time
# 30 seconds for testing
app.jwtExpirationInMs=30000

# 24 hours for production (recommended)
# app.jwtExpirationInMs=86400000
```

### File Upload Settings

```properties
# Max file size for uploads
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

## 📁 Project Structure

```
01blog/
├── backend/
│   ├── src/main/java/com/_blog/_blog/
│   │   ├── config/           # Security & CORS configuration
│   │   ├── controller/       # REST API endpoints
│   │   ├── model/           # Entity classes
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # JWT & authentication
│   │   └── Application.java
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/
    └── src/app/
        ├── components/      # Angular components
        │   ├── login/
        │   ├── register/
        │   ├── dashboard/
        │   ├── user-profile/
        │   ├── admin-dashboard/
        │   ├── error/
        │   └── shared/
        │       ├── header/
        │       ├── post-card/
        │       ├── profile-sidebar/
        │       └── create-post/
        └── services/        # API & business logic services
```

## 🔐 Security Features

- **JWT Authentication:** Stateless token-based authentication
- **Password Encryption:** BCrypt hashing
- **CORS Protection:** Configured for localhost development
- **Role-Based Access Control:** USER and ADMIN roles
- **HTTP-Only Tokens:** Secure token storage
- **Request Validation:** Input sanitization and validation
- **SQL Injection Prevention:** Parameterized queries via JPA

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/user/{username}` - Get user's posts
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Toggle like
- `POST /api/posts/{id}/comments` - Add comment

### Users
- `GET /api/user/me` - Get current user
- `GET /api/user/{username}` - Get user profile
- `POST /api/user/follow/{username}` - Follow/unfollow user
- `GET /api/user/subscribed-posts` - Get feed from followed users

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/ban` - Ban user
- `GET /api/admin/posts` - Get all posts
- `GET /api/admin/reports` - Get all reports

## 🐛 Error Handling

The application handles various error scenarios:

- **401 Unauthorized:** Token expired/invalid → Automatic logout
- **403 Forbidden:** No permission → Error page with message
- **404 Not Found:** Resource doesn't exist → Error page
- **500 Server Error:** Backend issue → Error page with retry option

## 🎨 Customization

### Changing Theme Colors

Edit `frontend/src/styles.css` or component-specific CSS files:
```css
/* Primary colors */
--primary-color: #e91e63;
--accent-color: #ff2e2e;
--background-color: #000000;
```

### Adjusting Token Expiration

For production, use 24 hours (86400000 ms):
```properties
app.jwtExpirationInMs=86400000
```

For testing, use 30 seconds:
```properties
app.jwtExpirationInMs=30000
```

## 📝 Development Notes

- **Backend Port:** 8080
- **Frontend Port:** 4200
- **Database Port:** 5432
- **Auto-reload:** Both frontend and backend support hot reload during development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Angular Material for UI components
- Spring Boot for backend framework
- PostgreSQL for database
- JWT.io for token generation

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions

---

**Built with ❤️ and ☕ by [Your Name]**

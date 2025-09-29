# Facebook Groups Auction Management

A professional web application for tracking and managing Facebook group post and live feed auction bids in comments.

## Features

### 🏠 Dashboard
- Overview of active and past auctions
- Key statistics and metrics
- Recent auction activity
- Top bidders leaderboard

### 🎯 Auction Management
- Track active and past auctions
- Monitor bid activity and highest bidders
- Time remaining calculations
- Status management (active, ended, cancelled)
- Search and filter functionality

### ⚙️ Settings Dashboard
- **Australian Defaults**: Pre-configured with Australian timezone (Australia/Sydney) and language (en-AU)
- Timezone selection (supports all Australian timezones)
- Language preferences
- Currency settings (AUD default)
- Date and time format customization
- Notification preferences
- Data management options

### 📊 Professional UI
- Clean, modern interface built with Tailwind CSS
- Responsive design for desktop and mobile
- Professional color scheme and typography
- Intuitive navigation and user experience

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Heroicons
- **Date Handling**: date-fns with timezone support
- **UI Components**: Custom component library

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd facebook-groups-auction-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
MONGODB_URI=mongodb+srv://auctionuser:Chloe2006##@app.rznajn1.mongodb.net/?retryWrites=true&w=majority&appName=app
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The application uses MongoDB with the following collections:
- `auctions` - Stores auction data
- `bids` - Stores bid information
- `groups` - Stores Facebook group settings
- `settings` - Stores application settings

The database connection is automatically established when the application starts.

## Facebook Groups API Alternatives

Since Facebook Groups API is no longer available, here are the recommended alternatives:

### 1. **GroupsTracker** (Recommended)
- **Website**: [groupstracker.com](https://groupstracker.com/api-for-facebook-groups)
- **Features**: 
  - Webhooks and API for monitoring Facebook groups
  - Keyword-based notifications
  - Real-time updates for new posts and comments
- **Integration**: Can be adapted to track auction bids with specific keywords

### 2. **Manual Data Entry**
- **Current Implementation**: The app supports manual auction and bid entry
- **Benefits**: Full control over data accuracy
- **Use Case**: For smaller operations or when automated tools aren't available

### 3. **Third-Party Monitoring Tools**
- Various social media monitoring services
- **Considerations**: Ensure compliance with Facebook's terms of service
- **Cost**: May require subscription fees

## Data Collection Strategy

### Recommended Approach:
1. **Use GroupsTracker** for automated monitoring of Facebook groups
2. **Set up keyword filters** for auction-related terms (e.g., "auction", "bid", "sale")
3. **Configure webhooks** to receive real-time notifications
4. **Manual verification** for important auctions to ensure accuracy

### Implementation Steps:
1. Sign up for GroupsTracker service
2. Configure group monitoring with auction keywords
3. Set up webhook endpoints to receive notifications
4. Parse incoming data and create auction records
5. Use manual entry as backup for critical auctions

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard page
│   ├── auctions/          # Auction management pages
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions and data
│   ├── types.ts         # TypeScript type definitions
│   ├── data.ts          # Mock data and default settings
│   └── utils.ts         # Utility functions
└── README.md            # This file
```

## Key Features Explained

### Australian Defaults
- **Timezone**: Australia/Sydney (AEST/AEDT)
- **Language**: English (Australia) - en-AU
- **Currency**: Australian Dollar (AUD)
- **Date Format**: DD/MM/YYYY (Australian standard)

### Auction Tracking
- Real-time bid monitoring
- Automatic status updates
- Time remaining calculations
- Bid history tracking
- Winner determination

### Settings Management
- Comprehensive configuration options
- Timezone and language support
- Notification preferences
- Data export capabilities
- Auto-archiving settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository or contact the development team.

---

**Note**: This application is designed to work with Facebook group auction data. Due to Facebook's API limitations, automated data collection requires third-party services or manual entry. Always ensure compliance with Facebook's terms of service when implementing data collection solutions.

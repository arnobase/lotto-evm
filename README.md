# Lotto EVM

A modern and user-friendly lottery dApp UI built with Next.js, TypeScript, and Tailwind CSS.

This UI interacts with:
- Smart Contracts: [lotto-evm](https://github.com/GuiGou12358/lotto-evm)
- Indexers: [lotto-multichain-subquery](https://github.com/GuiGou12358/lotto-multichain-subquery)

## Features

- 🎲 Participate in lottery draws by selecting 4 numbers
- 🌐 Multi-chain support (Minato, Moonbase, Shibuya)
- 🔄 Real-time transaction status with persistent notifications
- 📱 Fully responsive design
- 🎯 Last participation display
- 📊 Complete participation history with filtering options
- 🔍 Advanced search and filtering capabilities
- 📥 Export participation data to CSV

## Technical Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Web3 Integration**: ethers.js v6
- **State Management**: React Context
- **Data Fetching**: Apollo Client for SubQuery
- **UI Components**: Custom components with Headless UI
- **Notifications**: react-hot-toast
- **Testing**: Jest with React Testing Library

## Dependencies

### Smart Contracts
The UI interacts with smart contracts deployed from [lotto-evm](https://github.com/GuiGou12358/lotto-evm). These contracts handle:
- Lottery participation logic
- Number selection validation
- Draw management
- Multi-chain support

### Indexers
Data querying is powered by [lotto-multichain-subquery](https://github.com/GuiGou12358/lotto-multichain-subquery) which provides:
- Participation history
- Draw results
- Cross-chain data aggregation
- Real-time event indexing

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lotto-evm.git
cd lotto-evm
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUBQUERY_URL=your_subquery_url
```

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          
│   ├── common/          # Reusable components
│   ├── lottery/         # Lottery-specific components
│   └── web3/            # Web3 integration components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── libs/                # Utility functions and constants
└── public/              # Static assets
```

## Features in Detail

### Lottery Participation

- Select 4 numbers from 1 to 50
- Real-time validation
- Transaction status notifications
- Last participation display
- Automatic number sorting

### Transaction Management

- Persistent transaction status notifications
- Block explorer links
- Error handling with user-friendly messages
- Transaction cancellation handling

### History and Filtering

- View all participations
- Filter by draw number
- Filter by network
- Search by address
- Export data to CSV
- Pagination support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

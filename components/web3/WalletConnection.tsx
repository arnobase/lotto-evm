import { useWeb3 } from "../../contexts/Web3Context";
import account_svg from "../../public/images/account.svg"
import ExportedImage from "next-image-export-optimizer";

const headerStyle={
  button: `max-h[50px] flex items-center rounded-2xl lg:ml-2 ml-0 text-[0.9rem] font-semibold cursor-pointer`,
  buttonPadding: `p-0 lg:p-2`,
  buttonIconContainer: `flex items-center justify-center p-2`,
}

export default function WalletConnection() {
  const { evmAccount, evmConnectWallet, evmDisconnectWallet } = useWeb3();

  // Fonction pour formater l'adresse
  const formatAccountAddress = (address: string) => {
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  const Logout = () => {
    if (evmAccount) return <div className={`${headerStyle.button} ${headerStyle.buttonPadding}`}>
    <div className={headerStyle.buttonIconContainer} onClick={()=>{evmDisconnectWallet()}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 500 500">
        <path fill="#EEEEEE" d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
      </svg>
    </div>
  </div>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {evmAccount ? (
          <>
          <Logout />
          <p style={{ marginRight: '10px' }}>Connected: {formatAccountAddress(evmAccount.address)}</p>
          </>
      ) : (
        <div className={`${headerStyle.button} ${headerStyle.buttonPadding}`}>
          <div className={headerStyle.buttonIconContainer}>
            <ExportedImage alt="account" className="invert cursor-pointer" onClick={evmConnectWallet} src={account_svg} />
          </div>
        </div>
      )}
    </div>
  );
}

document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connect-wallet');
    const sendSolButton = document.getElementById('send-sol');
    const walletInfo = document.getElementById('wallet-info');
  
    let walletAddress = null;
    let provider = null;
  
    // Function to detect if the device is mobile
    const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
    // Function to connect to Phantom Wallet
    const connectWallet = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                walletAddress = response.publicKey.toString();
                provider = window.solana;
  
                walletInfo.textContent = `Connected: ${walletAddress}`;
                sendSolButton.disabled = false;
            } catch (error) {
                console.error('Error connecting to Phantom Wallet:', error);
                alert('Failed to connect with Phantom Wallet.');
            }
        } else if (isMobile()) {
            // Handle Mobile Wallet connection with a deep link
            const mobileURL = 'https://phantom.app/ul/v1/connect?app_url=https%3A%2F%2Fyour-app-url&redirect_link=https%3A%2F%2Fyour-app-url';
            window.location.href = mobileURL; // Redirect to Phantom mobile wallet
        } else {
            alert('Phantom Wallet is not installed. Please install it to continue.');
        }
    };
  
    // Function to send SOL
    const sendSol = async () => {
        if (!walletAddress || !provider) {
            alert('Please connect your wallet first.');
            return;
        }
  
        try {
            // Establish connection to Solana
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
  
            // Create transaction
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: new solanaWeb3.PublicKey(walletAddress),
                    toPubkey: new solanaWeb3.PublicKey('AXsfgqsu3hbXxG5WVqNX4Tac1dV7cSKExMrh8P9FoCfx'), // Replace with a valid recipient address
                    lamports: 0.01 * 1e9, // 0.01 SOL
                })
            );
  
            // Get recent blockhash
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = new solanaWeb3.PublicKey(walletAddress);
  
            // Sign and send transaction
            const signedTransaction = await provider.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature);
  
            alert(`Transaction successful! Signature: ${signature}`);
        } catch (error) {
            console.error('Error sending SOL:', error);
            alert('Transaction failed.');
        }
    };
  
    // Event listeners for buttons
    connectWalletButton.addEventListener('click', connectWallet);
    sendSolButton.addEventListener('click', sendSol);
  });  
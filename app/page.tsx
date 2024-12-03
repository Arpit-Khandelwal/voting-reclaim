"use client";
import { useState, useEffect } from 'react';
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from 'react-qr-code';
import { useAccount, useContractWrite } from 'wagmi';
import { parseEther } from 'viem';

const APP_ID = '0x22918ad92Ea4D8641Ba1Da5c96C87591842f1D24'
const APP_SECRET = '0xbe119a4a5fe36d70322f377235c61ca71f8fed5e114953047d98d4526ce0046e'
const PROVIDER_ID = 'a9f1063c-06b7-476a-8410-9ff6e427e637'

const CONTRACT_ADDRESS = '0x9d2ade18cb6bea1a';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const { address } = useAccount();

  const { write: castVote } = useContractWrite({
    address: CONTRACT_ADDRESS as `0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B`,
    abi: [{
      name: 'castVote',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: '_option', type: 'uint256' }],
      outputs: []
    }],
    functionName: 'castVote',
  });


  // const reclaimClient = new ReclaimProofRequest(APP_ID); //TODO: replace with your applicationId

  const reclaimClient =  ReclaimProofRequest.init(APP_ID, APP_SECRET,PROVIDER_ID);

  async function generateVerificationRequest() {
      
    const url  =  await (await reclaimClient).getRequestUrl();
    setUrl(url);

    // const statusRes =  (await reclaimClient).getVerificationRequestStatus(requestId);
    // if (statusRes?.status === 'verified') {
    //   setIsVerified(true);
    // }
    // Start the session for better UX
    (await reclaimClient).startSession({
      onSuccess: (proofs) => {
        if (proofs) {
          if (typeof proofs === 'string') {
            // When using a custom callback url, the proof is returned to the callback url and we get a message instead of a proof
            console.log('SDK Message:', proofs);
            setIsVerified(true);
          } else if (typeof proofs !== 'string') {
            // When using the default callback url, we get a proof object in the response
            console.log('Proof received:', proofs?.claimData.context);
            setIsVerified(true);
          }
        }
        // Handle successful verification (e.g., update UI, send to backend)
      },
      onError: (error) => {
        console.error('Verification failed', error);
        // Handle verification failure (e.g., show error message)
      },
    });
  }

  const handleVote = async () => {
    if (!isVerified) return;
    try {
      await castVote({ args: [selectedOption] });
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  return (
    <main className='min-h-screen p-8'>
      <h1 className='text-3xl font-bold mb-8'>Secure Voting Platform</h1>

      {!isVerified ? (
        <div className='space-y-4'>
          <button
            onClick={generateVerificationRequest}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Verify Identity using Linkedin
          </button>
          {url && (
            <div className='p-4 bg-white'>
              <QRCode value={url} />
            </div>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          <h2 className='text-xl'>Cast Your Vote</h2>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(Number(e.target.value))}
            className='border p-2 rounded'
          >
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
          </select>
          <button
            onClick={handleVote}
            className='bg-green-500 text-white px-4 py-2 rounded'
          >
            Submit Vote
          </button>
        </div>
      )}
    </main>
  );
}
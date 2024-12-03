"use client";
import { useState, useEffect } from 'react';
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from 'react-qr-code';
import { useAccount, useContractWrite } from 'wagmi';
import { parseEther } from 'viem';

const APP_ID = 'YOUR_APP_ID';
const APP_SECRET = 'YOUR_APP_SECRET';
const PROVIDER_ID = 'YOUR_PROVIDER_ID';
const CONTRACT_ADDRESS = '0x9d2ade18cb6bea1a';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const { address } = useAccount();

  const { write: castVote } = useContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: [{
      name: 'castVote',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: '_option', type: 'uint256' }],
      outputs: []
    }],
    functionName: 'castVote',
  });

  const APP_ID = '0x22918ad92Ea4D8641Ba1Da5c96C87591842f1D24'
  const APP_SECRET = '0xbe119a4a5fe36d70322f377235c61ca71f8fed5e114953047d98d4526ce0046e'
  const PROVIDER_ID = 'a9f1063c-06b7-476a-8410-9ff6e427e637'

  const reclaimClient = new Reclaim.ProofRequest(APP_ID); //TODO: replace with your applicationId

  // const reclaimClient =  ReclaimProofRequest.init(APP_ID, APP_SECRET,PROVIDER_ID);

  async function generateVerificationRequest() {
    (await reclaimClient).addContext(
      'user KYC verification',
      'Verify identity for voting'
    );

    reclaimClient.buildProofRequest(PROVIDER_ID);

    reclaimClient.setSignature(
      reclaimClient.generateSignature(APP_SECRET)
    );

    const { url, requestId } = await reclaimClient.createVerificationRequest();
    setUrl(url);

    const statusRes = await reclaimClient.getVerificationRequestStatus(requestId);
    if (statusRes?.status === 'verified') {
      setIsVerified(true);
    }
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
            Verify Identity
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
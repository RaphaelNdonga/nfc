export default async function handler(req, res) {
    const { signal, merkle_root, nullifier_hash, proof } = req.body;
    const verificationResponse = await fetch("https://developer.worldcoin.org/api/v1/verify", {
        signal: signal,
        action_id: 'wid_staging_e7d4e0d03153192325b86179969b9bbe',
        merkle_root,
        nullifier_hash,
        proof
    });
    if (verificationResponse.ok) {
        return res.status(200);
    }
    return res.status(400);
}
import * as fal from '@fal-ai/serverless-client';
import { useEffect, useState } from 'react';

fal.config({
  proxyUrl: '/api/fal/proxy', // the built-in Next.js proxy or your own external proxy
});

const TextToImage = () => {
  const [image, setImage] = useState(null); // Store the image URL
  const [inferenceTime, setInferenceTime] = useState(0); // Store the inference time
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {
    setIsLoading(true); // Start loading

    // Establish a real-time connection to the FAL service
    const connection = fal.realtime.connect('fal-ai/fast-lightning-sdxl', {
      connectionKey: 'lightning-sdxl',
      throttleInterval: 64,
      onResult: (result) => {
        // Assuming result.images[0].content is the binary content of the image
        const blob = new Blob([result.images[0].content], {
          type: 'image/jpeg',
        });
        setImage(URL.createObjectURL(blob)); // Create a URL for the blob
        setInferenceTime(result.timings.inference); // Set the inference time
        setIsLoading(false); // Update loading state
      },
      onError: (error) => {
        console.error(error);
        setError('Failed to generate image.'); // Update state to show an error message
        setIsLoading(false); // Stop loading
      },
    });

    // Send the prompt to the FAL service
    connection.send({
      prompt:
        'photo of a girl smiling during a sunset, with lightnings in the background',
      _force_msgpack: new Uint8Array([]),
      enable_safety_checker: true,
      image_size: 'square_hd',
      sync_mode: true,
      num_images: 1,
      num_inference_steps: '2',
      // Include other parameters as needed
    });

    // Clean up the connection when the component unmounts
    return () => {
      connection.close();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Text to Image</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : image ? (
        <div>
          <img src={image} alt="Generated" />
          <p>Inference time: {inferenceTime}ms</p>
        </div>
      ) : (
        <p>No image generated yet.</p>
      )}
    </div>
  );
};

export default TextToImage;

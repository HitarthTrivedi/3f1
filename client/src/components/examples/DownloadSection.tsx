import DownloadSection from '../DownloadSection';

export default function DownloadSectionExample() {
  const handleDownloadJson = () => {
    console.log('Download JSON triggered');
  };

  const handleDownloadText = () => {
    console.log('Download TXT triggered');
  };

  return (
    <DownloadSection
      onDownloadJson={handleDownloadJson}
      onDownloadText={handleDownloadText}
    />
  );
}

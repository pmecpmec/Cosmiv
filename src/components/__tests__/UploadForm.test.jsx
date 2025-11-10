import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UploadForm from '../UploadForm';

jest.mock('../ProgressBar', () => ({ progress, isProcessing, isComplete }) => (
  <div data-testid="progress-bar" data-progress={progress} data-processing={isProcessing} data-complete={isComplete}>
    Progress Mock
  </div>
));

describe('UploadForm', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  const renderComponent = () => render(<UploadForm />);

  it('shows an error when non-supported files are selected', async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('#clip-upload-input');
    expect(fileInput).toBeTruthy();

    const badFile = new File(['text'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      await screen.findByText(/please choose video files \(mp4, mov, webm, mkv, avi\) or a zip archive/i),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /sync upload/i })).toBeDisabled());
  });

  it('displays selected file names and enables actions', async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('#clip-upload-input');
    const fileA = new File(['a'], 'clip-a.mp4', { type: 'video/mp4' });
    const fileB = new File(['b'], 'clip-b.mov', { type: 'video/quicktime' });

    fireEvent.change(fileInput, { target: { files: [fileA, fileB] } });

    expect(await screen.findByText('clip-a.mp4')).toBeInTheDocument();
    expect(screen.getByText('clip-b.mov')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sync upload/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /async v2/i })).toBeEnabled();
  });

  it('clears selected files when Clear is pressed', async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('#clip-upload-input');
    const file = new File(['a'], 'clip.mp4', { type: 'video/mp4' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(await screen.findByText('clip.mp4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    await waitFor(() => expect(screen.queryByText('clip.mp4')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /sync upload/i })).toBeDisabled();
  });
});

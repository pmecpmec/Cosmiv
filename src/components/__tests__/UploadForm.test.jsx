import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadForm from '../UploadForm';

jest.mock('../ProgressBar', () => ({ progress, isProcessing, isComplete }) => (
  <div data-testid="progress-bar" data-progress={progress} data-processing={isProcessing} data-complete={isComplete}>
    Progress Mock
  </div>
));

describe('UploadForm', () => {
  beforeEach(() => {
    global.fetch.mockReset();
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  const renderComponent = () => render(<UploadForm />);

  it('shows an error when non-video files are selected', async () => {
    renderComponent();

    const fileInput = document.getElementById('file-upload');
    const badFile = new File(['text'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(await screen.findByText(/please select a zip or one\/more video files/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sync \(mvp\) download/i })).toBeDisabled(),
    );
  });

  it('uploads multiple video files and shows preview on success', async () => {
    const blobMock = new Blob(['video'], { type: 'video/mp4' });

    global.fetch.mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(blobMock),
    });

    renderComponent();

    const fileInput = document.getElementById('file-upload');
    const fileA = new File(['a'], 'clip-a.mp4', { type: 'video/mp4' });
    const fileB = new File(['b'], 'clip-b.mov', { type: 'video/quicktime' });

    fireEvent.change(fileInput, { target: { files: [fileA, fileB] } });

    const syncButton = screen.getByRole('button', { name: /sync \(mvp\) download/i });
    expect(syncButton).toBeEnabled();

    await userEvent.click(syncButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/api/upload-clips');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.getAll('files')).toHaveLength(2);
    expect(await options.body.get('target_duration')).toBe('60');

    await waitFor(() => expect(screen.getByText(/your highlight is ready/i)).toBeInTheDocument());
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(blobMock);
  });

  it('displays error message when upload fails', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Upload failed' }),
    });

    renderComponent();

    const fileInput = document.getElementById('file-upload');
    const file = new File(['a'], 'clip.mp4', { type: 'video/mp4' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const syncButton = screen.getByRole('button', { name: /sync \(mvp\) download/i });
    await userEvent.click(syncButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/upload failed/i)).toBeInTheDocument());
  });
});

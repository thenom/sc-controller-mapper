import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReferralCodeCard } from '../ReferralCodeCard';
import { CREATOR_REFERRAL_CODE, REFERRAL_POOL, getRandomReferral, getEnlistUrl } from '../../data/referralCodes';

describe('ReferralCodeCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the referral card with creator code by default', () => {
    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);

    expect(screen.getByTestId('referral-code-card')).toBeDefined();
    expect(screen.getByText(/STAR CITIZEN RECRUIT ENLISTMENT & REFERRAL HUB/i)).toBeDefined();
    expect(screen.getByText(/\+5,000 UEC BONUS/i)).toBeDefined();
    expect(screen.getByTestId('referral-code-display').textContent).toBe(CREATOR_REFERRAL_CODE);
    expect(screen.getByText('@thenom')).toBeDefined();
    expect(screen.getByText('Project Creator')).toBeDefined();
  });

  it('has a functional enlist link pointing to the official RSI enlist page', () => {
    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);

    const enlistLink = screen.getByRole('link', { name: /ENLIST WITH CODE/i });
    expect(enlistLink).toBeDefined();
    expect(enlistLink.getAttribute('target')).toBe('_blank');
    expect(enlistLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(enlistLink.getAttribute('href')).toBe(
      `https://www.robertsspaceindustries.com/enlist?referral=${CREATOR_REFERRAL_CODE}`
    );
  });

  it('copies the referral code to clipboard and displays feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);

    const copyBtn = screen.getByRole('button', { name: /Copy Code/i });
    await act(async () => {
      fireEvent.click(copyBtn);
      await Promise.resolve();
    });

    expect(writeTextMock).toHaveBeenCalledWith(CREATOR_REFERRAL_CODE);
    expect(screen.getByText('COPIED!')).toBeDefined();

    // Fast-forward 2 seconds to verify it resets
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Copy Code')).toBeDefined();
  });

  it('uses textarea fallback when navigator.clipboard is unavailable', async () => {
    // @ts-ignore
    const origClipboard = navigator.clipboard;
    // @ts-ignore
    delete navigator.clipboard;
    // JSDOM doesn't have execCommand by default
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);
    const copyBtn = screen.getByRole('button', { name: /Copy Code/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByText('COPIED!')).toBeDefined();

    // @ts-ignore
    navigator.clipboard = origClipboard;
  });


  it('handles clipboard copy error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard blocked'))
      }
    });

    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);
    const copyBtn = screen.getByRole('button', { name: /Copy Code/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });


  it('opens and closes the "What\'s this?" modal with Ko-fi and GitHub instructions', async () => {
    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);

    expect(screen.queryByTestId('referral-help-modal')).toBeNull();

    const whatIsThisBtn = screen.getByRole('button', { name: /What's this\?/i });
    fireEvent.click(whatIsThisBtn);

    expect(screen.getByTestId('referral-help-modal')).toBeDefined();
    expect(screen.getByText(/What is a Star Citizen Referral Code\?/i)).toBeDefined();
    expect(screen.getByText(/How to Get Your Own Referral Code Added to the Pool/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Fuel on Ko-fi/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /View GitHub Repo/i })).toBeDefined();

    // Close modal via close X button
    const closeXBtn = screen.getByTitle('Close modal');
    fireEvent.click(closeXBtn);
    expect(screen.queryByTestId('referral-help-modal')).toBeNull();

    // Re-open and close with bottom Close button
    fireEvent.click(whatIsThisBtn);
    expect(screen.getByTestId('referral-help-modal')).toBeDefined();
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('referral-help-modal')).toBeNull();
  });

  it('renders badges for supporter and contributor roles', () => {
    const supporter = REFERRAL_POOL.find(r => r.role === 'supporter');
    if (supporter) {
      const { unmount } = render(<ReferralCodeCard initialCode={supporter.code} />);
      expect(screen.getByText(supporter.roleLabel)).toBeDefined();
      unmount();
    }

    const contributor = REFERRAL_POOL.find(r => r.role === 'contributor');
    if (contributor) {
      const { unmount } = render(<ReferralCodeCard initialCode={contributor.code} />);
      expect(screen.getByText(contributor.roleLabel)).toBeDefined();
      unmount();
    }
  });

  it('opens help modal when clicking "Learn how →"', () => {
    render(<ReferralCodeCard initialCode={CREATOR_REFERRAL_CODE} />);

    const learnHowBtn = screen.getByRole('button', { name: /Learn how →/i });
    fireEvent.click(learnHowBtn);

    expect(screen.getByTestId('referral-help-modal')).toBeDefined();
  });


  it('handles randomizer reroll button click without error', () => {
    render(<ReferralCodeCard />);

    const rerollBtn = screen.getByTitle(/Randomize code from our supporter & contributor pool/i);
    expect(rerollBtn).toBeDefined();

    fireEvent.click(rerollBtn);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const codeDisplay = screen.getByTestId('referral-code-display');
    expect(codeDisplay.textContent).toBeTruthy();
  });

  describe('referralCodes helpers', () => {
    it('generates correct enlist URL', () => {
      expect(getEnlistUrl('STAR-7TZ5-ZNDC')).toBe(
        'https://www.robertsspaceindustries.com/enlist?referral=STAR-7TZ5-ZNDC'
      );
    });

    it('returns creator entry if pool is empty or single entry', () => {
      const single = getRandomReferral([REFERRAL_POOL[0]]);
      expect(single.code).toBe(CREATOR_REFERRAL_CODE);

      const empty = getRandomReferral([]);
      expect(empty.code).toBe(CREATOR_REFERRAL_CODE);
    });

    it('picks another entry when multiple codes exist in pool', () => {
      const mockPool = [
        {
          code: 'STAR-AAAA-1111',
          pilotName: 'PilotA',
          role: 'creator' as const,
          roleLabel: 'Creator'
        },
        {
          code: 'STAR-BBBB-2222',
          pilotName: 'PilotB',
          role: 'contributor' as const,
          roleLabel: 'Contributor'
        }
      ];

      const picked = getRandomReferral(mockPool, 'STAR-AAAA-1111');
      expect(picked.code).toBe('STAR-BBBB-2222');
    });
  });
});

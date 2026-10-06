import { NextResponse } from 'next/server';
import { AppError } from './app-error';

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  const errMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Unhandled API error:', error);

  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : errMessage,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

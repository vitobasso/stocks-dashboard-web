import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const relativePath = "../ai-scraper/output/20250701/statusinvest/data/ready/20250701T140910.csv"

export async function GET() {
    const filePath = path.join(process.cwd(), relativePath);
    const content = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(content);
}
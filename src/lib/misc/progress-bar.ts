export const createProgressBar = (progress: number, max: number, numberOfBars: number, showPercentage: boolean): string => {
	const UNFILLED = '▱';
	const FILLED = '▰';

	const progressPerBar = max / numberOfBars;
	const barsToFill = Math.floor(progress / progressPerBar);
	const barsLeft = numberOfBars - barsToFill;
	const percentage = showPercentage ? ` ${parseFloat(((progress / max) * 100).toFixed(1))}%` : '';

	const progressBarText = `${FILLED.repeat(barsToFill)}${UNFILLED.repeat(barsLeft)}${percentage}`;
	return progressBarText;
};

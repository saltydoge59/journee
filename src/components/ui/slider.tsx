import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

interface MinimumDistanceSliderProps {
  min: number;
  max: number;
  onValueChange?: (values: number[]) => void; // Callback to pass selected values
}

export default function MinimumDistanceSlider({ min, max, onValueChange }: MinimumDistanceSliderProps) {
  const [value, setValue] = React.useState<number[]>([min, max]);

  const handleChange = (
    event: Event,
    newValue: number | number[],
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    setValue(newValue as number[]);

    // Trigger the callback with the updated values
    if (onValueChange) {
        onValueChange(newValue as number[]);
    }
  };

  return (
    <Box sx={{ width: 300}}>
      <Slider
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        valueLabelDisplay="auto"
        disableSwap
      />
    </Box>
  );
}

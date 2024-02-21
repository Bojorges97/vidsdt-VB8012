from math import pi, sqrt, log, exp, cos
from numpy import arange, fft

class GaussianPulse:
    def __init__(self, amplitude, frecuency, NSamples, fs, HalfGuassianWidth):
        self.amp = amplitude
        self.frec = frecuency
        self.nsamples = NSamples
        self.dt = 1/fs
        self.dw = (2 * pi)/(NSamples*self.dt)
        self.d = HalfGuassianWidth
        samples = self.getSamples(NSamples)
        (self.t, self.y, self.w) = self.GaussianFunction(samples)
        
    def getFFT(self):
        return abs(fft.fft(self.y))
       
    def getSamples(self, n):
        return arange(0, n, 1, dtype=float)
        
    def GaussianFunction(self, samples):
        omega = 2 * pi * self.frec
        campaignCut = 0.01
        sigma = self.d/sqrt(log(1/campaignCut))
        y = []
        x = []
        w = []
        for sample in samples:
            t = sample*self.dt
            f = sample*self.dw
            exponentialPart = exp(-pow((t-self.d)/sigma, 2))
            cosinePart = cos(omega*(t-self.d))
            x.append(t)
            y.append(self.amp*exponentialPart*cosinePart)
            w.append(f)
        return (x, y, w)
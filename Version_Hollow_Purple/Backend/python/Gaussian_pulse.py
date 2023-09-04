#! /usr/bin/env python3

from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from numpy import array, savetxt
# from matplotlib import pyplot as plt # Debug

def createGaussianPulse(amplitude, frecuency, NSamples, fs, HalfGuassianWidth):

    pulse = GaussianPulse(amplitude, frecuency, NSamples, fs, HalfGuassianWidth)
    pulse.getFFT() 

    pulseArray = array(pulse.y)
    # w = pulse.w  # Debug
    # savetxt('test.txt', pulseArray) # Debug
    # plt.plot(w, frecFunction, color="red") # Debug
    # plt.show() # Debug

    fgen = virtualbench.acquire_function_generator()
    
    fgen.configure_arbitrary_waveform(pulseArray.tolist(), 0.00001)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    fgen.release()
    

try:
    global virtualbench
    virtualbench = PyVirtualBench('VB8012-31C033D')
    amplitude = 1      #[V]
    frecuency = 10        #[Hz]
    NSamples = 1000 
    fs = 2               #[S/s]
    HalfGuassianWidth = 3 
    createGaussianPulse(amplitude, frecuency, NSamples, fs, HalfGuassianWidth)
except PyVirtualBenchException as e:
    print("Error/Warning %d occurred\n%s" % (e.status, e))
finally:
    virtualbench.release()

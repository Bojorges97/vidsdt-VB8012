#! /usr/bin/env python3

import asyncio
from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from websockets.server import serve
from numpy import array, savetxt
import json
# from matplotlib import pyplot as plt # Debug

def createGaussianPulse(inputs):
    print(inputs)
    pulse = GaussianPulse(inputs['amplitude'], inputs['frecuency'], inputs['nSamples'], inputs['fs'], inputs['hgw'])
    pulse.getFFT() 

    pulseArray = array(pulse.y)
    global sample_rate
    sample_rate = 1/float(inputs['sampleRate'])
    # w = pulse.w  # Debug
    # savetxt('test.txt', pulseArray) # Debug
    # plt.plot(w, frecFunction, color="red") # Debug
    # plt.show() # Debug

    fgen = virtualbench.acquire_function_generator()
    
    fgen.configure_arbitrary_waveform(pulseArray.tolist(), sample_rate)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    fgen.release()

async def echo(websocket):
    async for message in websocket:
        msg = json.loads(message)
        print(msg)
        try:
          createGaussianPulse(msg)
        except PyVirtualBenchException as e:
            print("Error/Warning %d occurred\n%s" % (e.status, e))
        finally:
            virtualbench.release()
    

if __name__ == '__main__':
    global virtualbench
    virtualbench = PyVirtualBench('VB8012-31C033D')
    
    async def main():
        print("Service Up....")
        async with serve(echo, "192.168.0.129", 80):
            await asyncio.Future()  # run forever

    asyncio.run(main())

